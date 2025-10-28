using Microsoft.EntityFrameworkCore;
using System.Transactions;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class SupplyAndSellRepository : BaseRepository, ISupplyAndSellRepository
    {
        public SupplyAndSellRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<bool> Add(SupplyAndSellParameters supplyAndSell)
        {
            
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    int? roomMovementId = (int?)null;
                    if (!string.IsNullOrWhiteSpace(supplyAndSell.RoomNo))
                    {
                        if (await _context.Rooms.AnyAsync(s => s.RoomNo == supplyAndSell.RoomNo && !s.IsDeleted) == false)
                            throw new MyException(15);

                        if (!string.IsNullOrWhiteSpace(supplyAndSell.RoomNo))
                        {
                            var item = await _context.RoomMovements.FirstOrDefaultAsync(s => s.RoomNo == supplyAndSell.RoomNo && !s.IsClosed);

                            if (item is null)
                                throw new MyException(24);

                            roomMovementId = item.Id;
                        }
                    }

                    var productsItems = await _context.Products.ToListAsync();

                    var anyProductDoesNotExist = (from s in supplyAndSell.Items
                                                  join pT in productsItems on s.ProductCode equals pT.Code into pG
                                                  from p in pG.DefaultIfEmpty()
                                                  where p == null || p.IsDeleted
                                                  select s).Any();

                    if (anyProductDoesNotExist)
                        throw new MyException(16);

                    var roomName = await _context.Rooms.Where(s => s.RoomNo == supplyAndSell.RoomNo).Select(s => s.Title).FirstOrDefaultAsync();


                    var obj = new SupplyAndSell
                    {
                        DateAndTime = supplyAndSell.DateAndTime,
                        Total = 0,
                        IsSupply = supplyAndSell.IsSupply,
                        IsFree = supplyAndSell.IsFree,
                        RoomMovementId = roomMovementId,
                        IsDebt = supplyAndSell.IsDebt,
                        IsMistake = supplyAndSell.IsMistake,
                        IsForStaff = supplyAndSell.IsForStaff,
                        Discount = supplyAndSell.Discount,
                        EnteredBy = GetUserIdFromToken(),
                        EnteredOn = DateTime.Now
                    };

                    await _context.SupplyAndSells.AddAsync(obj);
                    await _context.SaveChangesAsync();

                    decimal totalAmount = 0;
                    foreach (var item in supplyAndSell.Items)
                    {
                        var objProductDB = productsItems.FirstOrDefault(s => s.Code == item.ProductCode);

                        totalAmount += objProductDB.Price * item.Quantity;
                        var article = new SupplyAndSellItem
                        {
                            SupplyAndSellId = obj.Id,
                            ProductCode = item.ProductCode,
                            Quantity = item.Quantity,
                            Price = objProductDB?.Price ?? 0,
                            CreatedBy = obj.EnteredBy,
                            CashierId = obj.IsDebt ? (int?)null : obj.EnteredBy
                        };

                        await _context.SupplyAndSellItems.AddAsync(article);
                        
                        if(obj.IsDebt == false && obj.IsSupply == false)
                        {
                            await _context.SaveChangesAsync();

                            var message = $"{article.Quantity} {objProductDB.Title}";
                            if (!string.IsNullOrWhiteSpace(roomName))
                                message += " në dhomën" + roomName;

                            await _context.Payments.AddAsync(new Payment
                            {
                                DisplayText = message,
                                Amount = article.Price * article.Quantity, // Always use actual price for tracking
                                EmployeeId = obj.EnteredBy,
                                EnteredOn = obj.EnteredOn,
                                SupplyAndSellItemsId = article.Id,
                                IsForStaff = obj.IsForStaff,
                            });
                        }

                    }

                    // Check stock availability before processing (only for sales, not supplies)
                    // REMOVED: Stock validation to allow negative stock for drinks
                    /*if (!supplyAndSell.IsSupply)
                    {
                        foreach (var item in supplyAndSell.Items)
                        {
                            var objProductDB = productsItems.FirstOrDefault(s => s.Code == item.ProductCode);
                            if (objProductDB != null)
                            {
                                if (objProductDB.Stock < item.Quantity)
                                {
                                    throw new MyExceptionMessage($"Nuk ka stok të mjaftueshëm për {objProductDB.Title}. Stoku disponueshëm: {objProductDB.Stock}, Kërkuar: {item.Quantity}");
                                }
                            }
                        }
                    }*/

                    // Update product stock for each item
                    foreach (var item in supplyAndSell.Items)
                    {
                        var objProductDB = productsItems.FirstOrDefault(s => s.Code == item.ProductCode);
                        if (objProductDB != null)
                        {
                            if (supplyAndSell.IsSupply)
                                objProductDB.Stock += item.Quantity; // Increase stock on supply
                            else
                            {
                                // Allow negative stock - no validation needed
                                objProductDB.Stock -= item.Quantity; // Decrease stock on sale (can go negative)
                            }
                            objProductDB.EnteredOn = DateTime.Now;
                        }
                    }
                    await _context.SaveChangesAsync();

                    await _context.SaveChangesAsync();

                    var updateAmountDB = await _context.SupplyAndSells.FirstOrDefaultAsync(s => s.Id == obj.Id);
                    updateAmountDB.Total = totalAmount;

                    await _context.SaveChangesAsync();

                    transactionScope.Complete();

                    return true;
                }
                catch (Exception)
                {
                    throw;
                }           
            }
        }

        public async Task<bool> Update(int supplyAndSellId, bool isDebt, IEnumerable<SupplyAndSellItemsParameters> supplyAndSellItems)
        {
           
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var productsItems = await _context.Products.ToListAsync();

                    var anyProductDoesNotExist = (from s in supplyAndSellItems
                                                  join pT in productsItems on s.ProductCode equals pT.Code into pG
                                                  from p in pG.DefaultIfEmpty()
                                                  where p == null || p.IsDeleted
                                                  select s).Any();

                    if (anyProductDoesNotExist)
                        throw new MyException(16);


                    var obj = await _context.SupplyAndSells.FirstOrDefaultAsync(s => s.Id == supplyAndSellId);

                    if(obj is null)
                        throw new MyException(4);

                    var roomName = await (from rm in _context.RoomMovements
                                          join r in _context.Rooms on rm.RoomNo equals r.RoomNo
                                          where rm.Id == obj.RoomMovementId
                                          select r.Title).FirstOrDefaultAsync();

                    if (obj.IsDebt == false && obj.IsSupply == false)
                    {
                        var itemsBefore = await _context.SupplyAndSellItems.Where(s => s.SupplyAndSellId == obj.Id && s.CashierId == null).ToListAsync();

                        foreach (var oldItem in itemsBefore)
                        {
                            var productObjOld = productsItems.FirstOrDefault(s => s.Code == oldItem.ProductCode);

                            var message = $"Konfirmim {oldItem.Quantity} {productObjOld?.Title ?? ""}";
                            if (!string.IsNullOrWhiteSpace(roomName))
                                message += " në dhomën" + roomName;

                            await _context.Payments.AddAsync(new Payment
                            {
                                DisplayText = message,
                                Amount = oldItem.Price * oldItem.Quantity, // Always use actual price for tracking, even for staff
                                EmployeeId = obj.EnteredBy,
                                EnteredOn = obj.EnteredOn,
                                SupplyAndSellItemsId = oldItem.Id
                                
                            });
                        }
                    }

                    var sumFromItems = await _context.SupplyAndSellItems.Where(s => s.SupplyAndSellId == obj.Id)
                                             .Select(s => new { Value = s.Quantity * s.Price }).SumAsync(s => s.Value);

                    
                   
                    decimal totalAmount = 0;
                    foreach (var item in supplyAndSellItems)
                    {
                        var objProductDB = productsItems.FirstOrDefault(s => s.Code == item.ProductCode);

                        totalAmount += objProductDB.Price * item.Quantity;
                        var article = new SupplyAndSellItem
                        {
                            SupplyAndSellId = obj.Id,
                            ProductCode = item.ProductCode,
                            Quantity = item.Quantity,
                            Price = objProductDB?.Price ?? 0,
                            CreatedBy = obj.EnteredBy,
                            CashierId = obj.IsDebt ? (int?)null : obj.EnteredBy
                        };

                        await _context.SupplyAndSellItems.AddAsync(article);

                        if (obj.IsDebt == false)
                        {
                            await _context.SaveChangesAsync();

                            var message = $"{article.Quantity} {objProductDB?.Title ?? ""}";
                            if (!string.IsNullOrWhiteSpace(roomName))
                                message += " në dhomën" + roomName;

                            await _context.Payments.AddAsync(new Payment
                            {
                                DisplayText = message,
                                Amount = article.Price * article.Quantity, // Always use actual price for tracking
                                EmployeeId = obj.EnteredBy,
                                EnteredOn = obj.EnteredOn,
                                SupplyAndSellItemsId = article.Id
                            });
                        }

                    }

                    // Check stock availability before processing (only for sales, not supplies)
                    // REMOVED: Stock validation to allow negative stock for drinks
                    /*if (!obj.IsSupply)
                    {
                        foreach (var item in supplyAndSellItems)
                        {
                            var objProductDB = productsItems.FirstOrDefault(s => s.Code == item.ProductCode);
                            if (objProductDB != null)
                            {
                                if (objProductDB.Stock < item.Quantity)
                                {
                                    throw new MyExceptionMessage($"Nuk ka stok të mjaftueshëm për {objProductDB.Title}. Stoku disponueshëm: {objProductDB.Stock}, Kërkuar: {item.Quantity}");
                                }
                            }
                        }
                    }*/

                    // Update product stock for each item
                    foreach (var item in supplyAndSellItems)
                    {
                        var objProductDB = productsItems.FirstOrDefault(s => s.Code == item.ProductCode);
                        if (objProductDB != null)
                        {
                            if (obj.IsSupply)
                                objProductDB.Stock += item.Quantity; // Increase stock on supply
                            else
                            {
                                // Allow negative stock - no validation needed
                                objProductDB.Stock -= item.Quantity; // Decrease stock on sale (can go negative)
                            }
                            objProductDB.EnteredOn = DateTime.Now;
                        }
                    }
                    await _context.SaveChangesAsync();

                    obj.Total = totalAmount + sumFromItems;
                    obj.IsDebt = isDebt;
                    obj.EnteredBy = GetUserIdFromToken();
                    obj.EnteredOn = DateTime.Now;

                    await _context.SaveChangesAsync();

                    transactionScope.Complete();
                    transactionScope.Dispose();

                    return true;
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    throw;
                }
            }
        }

        public async Task<bool> ConfirmPaid(int supplyAndSellId)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var item = await _context.SupplyAndSells.FirstOrDefaultAsync(s => s.Id == supplyAndSellId);

                    if (item is null)
                        throw new MyException(4);

                    if (item.IsDebt == false)
                        throw new MyException(25);


                    item.IsDebt = false;
                    item.EnteredBy = GetUserIdFromToken();
                    item.EnteredOn = DateTime.Now;

                    var itemsInBill = await _context.SupplyAndSellItems.Where(s => s.SupplyAndSellId == item.Id && s.CashierId == null).ToListAsync();
                    if (itemsInBill?.Any() ?? false)
                    {
                        var roomName = await (from rm in _context.RoomMovements
                                              join r in _context.Rooms on rm.RoomNo equals r.RoomNo
                                              where rm.Id == item.RoomMovementId
                                              select r.Title).FirstOrDefaultAsync();

                        var productIds = itemsInBill.Select(s => s.ProductCode).Distinct().ToList();

                        var product = await _context.Products.Where(s => productIds.Contains(s.Code)).ToListAsync();

                        foreach (var article in itemsInBill)
                        {
                            article.CashierId = item.EnteredBy;

                            var articleName = product.Where(s => s.Code == article.ProductCode).Select(s => s.Title).FirstOrDefault();

                            var message = $"Konfirmim {article.Quantity} {articleName}";
                            if (!string.IsNullOrWhiteSpace(roomName))
                                message += " në dhomën" + roomName;

                            await _context.Payments.AddAsync(new Payment
                            {
                                DisplayText = message,
                                Amount = article.Price * article.Quantity,
                                EmployeeId = item.EnteredBy,
                                EnteredOn = item.EnteredOn,
                                SupplyAndSellItemsId = article.Id
                            });

                            // Update product stock on confirm
                            var productObj = product.FirstOrDefault(s => s.Code == article.ProductCode);
                            if (productObj != null)
                            {
                                if (item.IsSupply)
                                    productObj.Stock += article.Quantity;
                                else
                                    productObj.Stock -= article.Quantity;
                                productObj.EnteredOn = DateTime.Now;
                                _context.Products.Update(productObj); // Ensure EF tracks the change
                                await _context.SaveChangesAsync();    // Persist immediately
                            }
                        }
                    }

                    await _context.SaveChangesAsync();

                    transactionScope.Complete();
                    transactionScope.Dispose();

                    return true;
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    throw;
                }
            }            
        }

        public async Task<bool> UpdateQuantityOfItems(int suppyAndSellItemId, int quantity)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var item = await _context.SupplyAndSellItems.FirstOrDefaultAsync(s => s.Id == suppyAndSellItemId);

                    if (item is null)
                        throw new MyException(4);

                    var obj = await _context.SupplyAndSells.FirstOrDefaultAsync(s => s.Id == item.SupplyAndSellId);

                    // Check stock availability if this is a sale (not supply)
                    // REMOVED: Stock validation to allow negative stock for drinks
                    /*if (!obj.IsSupply)
                    {
                        var product = await _context.Products.FirstOrDefaultAsync(s => s.Code == item.ProductCode);
                        if (product != null)
                        {
                            // Calculate the difference in quantity
                            var quantityDifference = quantity - item.Quantity;
                            
                            // If increasing quantity, check if we have enough stock
                            if (quantityDifference > 0 && product.Stock < quantityDifference)
                            {
                                throw new MyExceptionMessage($"Nuk ka stok të mjaftueshëm për {product.Title}. Stoku disponueshëm: {product.Stock}, Shtesë e kërkuar: {quantityDifference}");
                            }
                        }
                    }*/

                    var oldTotal = item.Quantity * item.Price;
                    item.Quantity = quantity;

                    obj.Total += (item.Price * quantity) - oldTotal;
                    obj.EnteredBy = GetUserIdFromToken();
                    obj.EnteredOn = DateTime.Now;

                    await _context.SaveChangesAsync();

                    var paymentObj = await _context.Payments.FirstOrDefaultAsync(s => s.SupplyAndSellItemsId == item.Id);
                    if(paymentObj is not null)
                    {
                        var articleName = await _context.Products.FirstOrDefaultAsync(s => s.Code == item.ProductCode);

                        var roomName = await (from rm in _context.RoomMovements
                                              join r in _context.Rooms on rm.RoomNo equals r.RoomNo
                                              where rm.Id == obj.RoomMovementId
                                              select r.Title).FirstOrDefaultAsync();

                        var message = $"{item.Quantity} {articleName?.Title ?? ""}";
                        if (!string.IsNullOrWhiteSpace(roomName))
                            message += " në dhomën" + roomName;

                        paymentObj.DisplayText = message;
                        paymentObj.Amount = item.Quantity * item.Price; // Always use actual price for tracking, even for staff
                    }

                    await _context.SaveChangesAsync();

                    transactionScope.Complete();
                    transactionScope.Dispose();

                    return true;
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    throw;
                }
            }
        }

        public async Task<bool> DeleteBill(int supplyAndSellId)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var obj = await _context.SupplyAndSells.FirstOrDefaultAsync(s => s.Id == supplyAndSellId);

                    if (obj is null)
                        throw new MyException(4);

                    var items = await _context.SupplyAndSellItems.Where(s => s.SupplyAndSellId == supplyAndSellId).ToListAsync();

                    if (items.Any())
                    {
                        var supplyItemsIds = items.Select(s => s.Id).ToList();

                        var payments = await _context.Payments.Where(s => s.SupplyAndSellItemsId != null 
                                && supplyItemsIds.Contains(s.SupplyAndSellItemsId.Value)).ToListAsync();

                        if (payments?.Any() ?? false)
                        {
                            _context.Payments.RemoveRange(payments);
                            _context.SaveChanges();
                        }

                        _context.SupplyAndSellItems.RemoveRange(items);
                    }

                    _context.SaveChanges();

                    _context.SupplyAndSells.Remove(obj);

                    _context.SaveChanges();

                    transactionScope.Complete();
                    transactionScope.Dispose();

                    return true;
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    throw;
                }
            }
        }

        public async Task<bool> DeleteItemInBill(int supplyAndSellItemsId)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var item = await _context.SupplyAndSellItems.FirstOrDefaultAsync(s => s.Id == supplyAndSellItemsId);

                    if (item is null)
                        throw new MyException(4);

                    var bill = await _context.SupplyAndSells.FirstOrDefaultAsync(s => s.Id == item.SupplyAndSellId);


                    bill.Total -= item.Quantity * item.Price;
                    bill.EnteredBy = GetUserIdFromToken();
                    bill.EnteredOn = DateTime.Now;

                    var payment = _context.Payments.FirstOrDefault(s => s.SupplyAndSellItemsId != null && s.SupplyAndSellItemsId.Value == item.Id);
                    if(payment is not null)
                    {
                        _context.Payments.Remove(payment);
                        _context.SaveChanges();
                    }
                    
                    _context.SupplyAndSellItems.Remove(item);

                    _context.SaveChanges();

                    transactionScope.Complete();
                    transactionScope.Dispose();

                    return true;
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    throw;
                }
            }            
        }

        public async Task<SupplyAndSellDTO?> GetBillWithItems(string roomNo)
        {
            if (string.IsNullOrWhiteSpace(roomNo))
                throw new MyException(4);

            if (await _context.Rooms.AnyAsync(s => s.RoomNo == roomNo) == false)
                throw new MyException(15);

            var bill =await (from s in _context.SupplyAndSells
                             join rm in _context.RoomMovements on s.RoomMovementId equals rm.Id
                       join r in _context.Rooms on rm.RoomNo equals r.RoomNo
                       join p in _context.Users on s.EnteredBy equals p.Id
                       where r.RoomNo == roomNo && s.IsDebt
                       select new SupplyAndSellDTO
                       {
                           Id = s.Id,
                           DateAndTime = s.DateAndTime,
                           Total = s.Total,
                           IsSupply = s.IsSupply,
                           IsFree = s.IsFree,
                           RoomNo = r.RoomNo,
                           RoomTitle = r.Title,
                           IsDebt = s.IsDebt,
                           IsMistake = s.IsMistake,
                           Discount = s.Discount,
                           EnteredBy = p.Username,
                           EnteredOn = s.EnteredOn

                       }).FirstOrDefaultAsync();

            var items = await (from s in _context.SupplyAndSellItems
                         join p in _context.Products on s.ProductCode equals p.Code
                         where s.SupplyAndSellId == (bill != null ? bill.Id : 0)
                         select new SupplyAndSellItemDTO
                         {
                             Id = s.Id,
                             ProductCode = s.ProductCode,
                             ProductName = p.Title,
                             Quantity = s.Quantity,
                             Price = s.Price
                         }).ToListAsync();
            
            if(bill is not null)
                bill.Items = items;

            return bill;
        }

        public async Task<IEnumerable<SupplyAndSellDTO>?> GetBills(DateTime fromDate, DateTime toDate)
        {
            var items = await (from s in _context.SupplyAndSells
                               join rm in _context.RoomMovements on s.RoomMovementId equals rm.Id
                              join r in _context.Rooms on rm.RoomNo equals r.RoomNo
                              join p in _context.Users on s.EnteredBy equals p.Id
                              where s.DateAndTime.Date >= fromDate.Date && s.DateAndTime.Date <= toDate.Date
                              select new SupplyAndSellDTO
                              {
                                  Id = s.Id,
                                  DateAndTime = s.DateAndTime,
                                  Total = s.Total,
                                  IsSupply = s.IsSupply,
                                  IsFree = s.IsFree,
                                  RoomNo = r.RoomNo,
                                  RoomTitle = r.Title,
                                  IsDebt = s.IsDebt,
                                  IsMistake = s.IsMistake,
                                  IsForStaff = s.IsForStaff,
                                  Discount = s.Discount,
                                  EnteredBy = p.Username,
                                  EnteredOn = s.EnteredOn

                              }).ToListAsync();

            return items;
        }

        public async Task<IEnumerable<SupplyAndSellItemDTO>?> GetItemsInBill(int billId)
        {
            var items = await (from s in _context.SupplyAndSellItems
                               join p in _context.Products on s.ProductCode equals p.Code
                               where s.SupplyAndSellId == billId
                               select new SupplyAndSellItemDTO
                               {
                                   Id = s.Id,
                                   ProductCode = s.ProductCode,
                                   ProductName = p.Title,
                                   Quantity = s.Quantity,
                                   Price = s.Price
                               }).ToListAsync();

            return items;
        }

        public async Task<IEnumerable<StockDTO>?> GetStock()
        {
            var articles = (from p in _context.Products
                         join c in _context.ProductCategories on p.Category equals c.Code
                         from si in _context.SupplyAndSellItems.Where(x => x.ProductCode == p.Code).DefaultIfEmpty()
                         from s in _context.SupplyAndSells.Where(x => x.Id == si.SupplyAndSellId).DefaultIfEmpty()
                         where !p.IsDeleted && p.IsActive
                         select new
                         {
                             ProductCode = p.Code,
                             Category = c.Description,
                             ProductName = p.Title,
                             OrdeNo = p.OrderNo,
                             Price = p.Price,
                             QuantityIn = s == null ? 0 : s.IsSupply ? si.Quantity : 0,
                             QuantityOut = s == null ? 0 : s.IsSupply == false ? si.Quantity : 0
                         });

         
            var items = await articles.GroupBy(s => s.ProductCode)
                  .Select(s => new StockDTO
                  {
                      OrderNo = s.FirstOrDefault().OrdeNo,
                      Category = s.FirstOrDefault().Category,
                      ProductName = s.FirstOrDefault().ProductName,
                      Price = s.FirstOrDefault().Price,
                      Quantity = s.Sum(x => x.QuantityIn) - s.Sum(x => x.QuantityOut)

                  }).OrderBy(s => s.Category).ThenBy(s => s.OrderNo).ToListAsync();

            return items;

        }

        public async Task<IEnumerable<SupplyAndSellItemDTO>?> GetBillForRoom(int roomMovementId)
        {
            var items = from si in _context.SupplyAndSellItems
                        join s in _context.SupplyAndSells on si.SupplyAndSellId equals s.Id
                        join p in _context.Products on si.ProductCode equals p.Code
                        where s.RoomMovementId == roomMovementId
                        select new SupplyAndSellItemDTO
                        {
                            Id = si.Id,
                            ProductCode = si.ProductCode,
                            ProductName = p.Title,
                            Quantity = si.Quantity,
                            Price = si.Price
                        };

            return await items.ToListAsync(); 
        }

    }
}
