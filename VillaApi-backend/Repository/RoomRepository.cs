using Microsoft.Build.Logging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Transactions;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class RoomRepository : BaseRepository, IRoomRepository
    {
        public RoomRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public string GenereateRoomNo()
        {
            int code = 0;

            if (_context.Rooms.Any())
            {
                code = _context.Rooms.Select(x => x.RoomNo).ToList().Select(s => new
                {
                    Value = int.TryParse(s, out int _val) ? _val : 0
                }).Max(x => x.Value);
            }

            return (code + 1).ToString("00");
        }

        public async Task<string?> GetRoomNo(int movementId)
        {
           return await _context.RoomMovements.Where(s => s.Id == movementId).Select(s => s.RoomNo).FirstOrDefaultAsync();
        }

        public async Task<bool> Add(RoomParameters parameters)
        {
            if (await _context.Rooms.AnyAsync(s => s.Title == parameters.Title))
                throw new MyException(23);

            if (await _context.RoomModels.AnyAsync(s => s.Code == parameters.RoomModel) == false)
                throw new MyException(21);

            await _context.Rooms.AddAsync(new Room
            {
                RoomNo = GenereateRoomNo(),
                Title = parameters.Title,
                OrderNo = parameters.OrderNo,
                RoomModel = parameters.RoomModel,
                IsActive = parameters.IsActive,
                EnteredBy = GetUserIdFromToken(),
                EnteredOn = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Update(RoomParameters parameters)
        {
            var item = await _context.Rooms.FirstOrDefaultAsync(s => s.RoomNo == parameters.RoomNo);

            if (item is null)
                throw new MyException(4);

            if (await _context.RoomModels.AnyAsync(s => s.Code == parameters.RoomModel) == false)
                throw new MyException(21);


            item.Title = parameters.Title;
            item.OrderNo = parameters.OrderNo;
            item.RoomModel = parameters.RoomModel;
            item.IsActive = parameters.IsActive;
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(string roomNo)
        {
            var item = await _context.Rooms.FirstOrDefaultAsync(s => s.RoomNo == roomNo);

            if (item is null)
                throw new MyException(4);

            item.IsDeleted = true;
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<RoomDTO>?> GetAllRooms()
        {
            var items = from r in _context.Rooms
                        join m in _context.RoomModels on r.RoomModel equals m.Code
                        join p in _context.Users on r.EnteredBy equals p.Id
                        where r.IsDeleted == false
                        select new RoomDTO
                        {
                            RoomNo = r.RoomNo,
                            Title = r.Title,
                            OrderNo = r.OrderNo,
                            RoomModel = r.RoomModel,
                            RoomModelDescription = m.Description,
                            IsActive = r.IsActive,
                            EnteredBy = p.Username,
                            EnteredOn = DateTime.Now
                        };

            return await items.OrderBy(s => s.OrderNo).ToListAsync();
        }

        public async Task<IEnumerable<RoomDTO>?> GetActiveRooms()
        {
            var items = from r in _context.Rooms
                        join m in _context.RoomModels on r.RoomModel equals m.Code
                        join p in _context.Users on r.EnteredBy equals p.Id
                        where r.IsDeleted == false && r.IsActive
                        select new RoomDTO
                        {
                            RoomNo = r.RoomNo,
                            Title = r.Title,
                            OrderNo = r.OrderNo,
                            RoomModel = r.RoomModel,
                            RoomModelDescription = m.Description,
                            IsActive = r.IsActive,
                            EnteredBy = p.Username,
                            EnteredOn = DateTime.Now
                        };

            return await items.OrderBy(s => s.OrderNo).ToListAsync();
        }

        public async Task<RoomDTO?> GetItem(string roomNo)
        {
            var items = from r in _context.Rooms
                        join m in _context.RoomModels on r.RoomModel equals m.Code
                        join p in _context.Users on r.EnteredBy equals p.Id
                        where r.RoomNo == roomNo && !r.IsDeleted
                        select new RoomDTO
                        {
                            RoomNo = r.RoomNo,
                            Title = r.Title,
                            OrderNo = r.OrderNo,
                            RoomModel = r.RoomModel,
                            RoomModelDescription = m.Description,
                            IsActive = r.IsActive,
                            EnteredBy = p.Username,
                            EnteredOn = DateTime.Now
                        };

            return await items.FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<RoomViewDTO>?> GetAvailableRooms(string roomModel)
        {
            var lstRooms = new List<RoomViewDTO>();
            var rooms = await (from r in _context.Rooms
                               join rm in _context.RoomModels on r.RoomModel equals rm.Code
                               where !r.IsDeleted && r.IsActive && rm.Code == roomModel
                               select new
                               {
                                   r.RoomNo,
                                   r.Title,
                                   rm.Code,
                                   rm.Description,
                                   r.OrderNo
                               }).ToListAsync();

            foreach (var item in rooms)
            {
                var obj = new RoomViewDTO();

                obj.OrderNo = item.OrderNo;
                obj.RoomNo = item.RoomNo;
                obj.Title = item.Title;
                obj.RoomModel = item.Code;
                obj.RoomModelDescription = item.Description;

               
                if(await _context.RoomMovements.AnyAsync(s => s.RoomNo == item.RoomNo && !s.IsClosed) == false)
                    lstRooms.Add(obj);
            }

            return lstRooms.OrderBy(s => s.OrderNo);
        }

        public async Task<IEnumerable<RoomViewDTO>?> GetRooms()
        {
            var lstRooms = new List<RoomViewDTO>();
            var rooms = await (from r in _context.Rooms
                        join rm in _context.RoomModels on r.RoomModel equals rm.Code
                        where !r.IsDeleted && r.IsActive
                        select new
                        {
                            r.RoomNo,
                            r.Title,
                            rm.Code,
                            rm.Description,
                            r.OrderNo
                        }).ToListAsync();

            foreach (var item in rooms)
            {
                var obj = new RoomViewDTO();

                obj.OrderNo = item.OrderNo;
                obj.RoomNo = item.RoomNo;
                obj.Title = item.Title;
                obj.RoomModel = item.Code;
                obj.RoomModelDescription = item.Description;

                var movementObj = await _context.RoomMovements.FirstOrDefaultAsync(s => s.RoomNo == item.RoomNo && !s.IsClosed);
                if (movementObj is not null)
                {
                    obj.IsOpen = true;
                    obj.RoomMovementId = movementObj.Id;

                    var lstDetailsOfRoom = await (from rd in _context.RoomDetails
                                                  join t in _context.RoomTypes on rd.RoomTypeCode equals t.Code
                                                  where rd.RoomMovementId == movementObj.Id
                                                  select new
                                                  {
                                                      rd.Id,
                                                      t.Code,
                                                      t.Description,
                                                      t.IsExtra,
                                                      rd.Price,
                                                      rd.Hours,
                                                      rd.IsDebt

                                                  }).ToListAsync();

                    var typeObj = lstDetailsOfRoom.OrderByDescending(s => s.Id).FirstOrDefault();

                    var amountArticles = await (from s in _context.SupplyAndSells
                                                join si in _context.SupplyAndSellItems on s.Id equals si.SupplyAndSellId
                                                where s.IsDebt && s.RoomMovementId == movementObj.Id
                                                select new { Val = si.Quantity * si.Price }).SumAsync(x => x.Val);

                    var debtDetails = lstDetailsOfRoom.Where(s => s.IsDebt).ToList();
                    var debtSum = debtDetails.Sum(s => s.Price);
                    var calculatedAmountDebt = -(debtSum + amountArticles);
                    
                    Console.WriteLine($"🔍 GetRooms Debug for room {item.RoomNo}:");
                    Console.WriteLine($"  - RoomMovementId: {movementObj.Id}");
                    Console.WriteLine($"  - DebtDetails count: {debtDetails.Count}");
                    Console.WriteLine($"  - DebtDetails: {string.Join(", ", debtDetails.Select(d => $"Id={d.Id}, IsDebt={d.IsDebt}, Price={d.Price}"))}");
                    Console.WriteLine($"  - DebtSum: {debtSum}");
                    Console.WriteLine($"  - AmountArticles: {amountArticles}");
                    Console.WriteLine($"  - CalculatedAmountDebt: {calculatedAmountDebt}");

                    obj.RoomType = typeObj.Code;
                    obj.RoomTypeDescription = typeObj.Description;
                    obj.IsExtraRoomType = typeObj.IsExtra;
                    obj.AmountDebt = calculatedAmountDebt;
                    obj.Hours = lstDetailsOfRoom.Sum(s => s.Hours);
                    obj.Price = lstDetailsOfRoom.Sum(s => s.Price);
                    obj.MinuteLeft = (obj.Hours * 60) - (int)DateTime.Now.Subtract(movementObj.EntryOn).TotalMinutes;
                    obj.EntryOn = movementObj.EntryOn; // Shtojmë kohën e hapjes
                    obj.ClientPlateNo = movementObj.ClientPlateNo; // Shtojmë numrin e tabelave
                    obj.ClientCarName = movementObj.ClientCarName; // Shtojmë emrin e veturës
                    obj.ClientDocument = movementObj.ClientDocument; // Shtojmë dokumentin e klientit

                }

                lstRooms.Add(obj);
            }

            return lstRooms.OrderBy(s => s.OrderNo);
        }

        public async Task<RoomViewDTO?> GetRoomByNo(string roomNo)
        {
            var obj = new RoomViewDTO();
            var item = await (from r in _context.Rooms
                              join rm in _context.RoomModels on r.RoomModel equals rm.Code
                              where !r.IsDeleted && r.IsActive && r.RoomNo == roomNo
                              select new
                              {
                                  r.RoomNo,
                                  r.Title,
                                  rm.Code,
                                  rm.Description,
                                  r.OrderNo
                              }).FirstOrDefaultAsync();

            if (item is null)
                throw new MyException(15);


            obj.OrderNo = item.OrderNo;
            obj.RoomNo = item.RoomNo;
            obj.Title = item.Title;
            obj.RoomModel = item.Code;
            obj.RoomModelDescription = item.Description;

            var movementObj = await _context.RoomMovements.FirstOrDefaultAsync(s => s.RoomNo == item.RoomNo && !s.IsClosed);
            if (movementObj is not null)
            {
                obj.IsOpen = true;
                obj.RoomMovementId = movementObj.Id;

                var lstDetailsOfRoom = await (from rd in _context.RoomDetails
                                              join t in _context.RoomTypes on rd.RoomTypeCode equals t.Code
                                              where rd.RoomMovementId == movementObj.Id
                                              select new
                                              {
                                                  rd.Id,
                                                  t.Code,
                                                  t.Description,
                                                  t.IsExtra,
                                                  rd.Price,
                                                  rd.Hours,
                                                  rd.IsDebt

                                              }).ToListAsync();

                var typeObj = lstDetailsOfRoom.OrderByDescending(s => s.Id).FirstOrDefault();

                var amountArticles = await (from s in _context.SupplyAndSells
                                            join si in _context.SupplyAndSellItems on s.Id equals si.SupplyAndSellId
                                            where s.IsDebt && s.RoomMovementId == movementObj.Id
                                            select new { Val = si.Quantity * si.Price }).SumAsync(x => x.Val);

                obj.RoomType = typeObj.Code;
                obj.RoomTypeDescription = typeObj.Description;
                obj.IsExtraRoomType = typeObj.IsExtra;
                obj.AmountDebt = lstDetailsOfRoom.Where(s => s.IsDebt).Sum(s => s.Price) + amountArticles;
                obj.Hours = lstDetailsOfRoom.Sum(s => s.Hours);
                obj.Price = lstDetailsOfRoom.Sum(s => s.Price);
                obj.MinuteLeft = (obj.Hours * 60) - (int)DateTime.Now.Subtract(movementObj.EntryOn).TotalMinutes;
                obj.EntryOn = movementObj.EntryOn; // Shtojmë kohën e hapjes
                obj.ClientPlateNo = movementObj.ClientPlateNo; // Shtojmë numrin e tabelave
                obj.ClientCarName = movementObj.ClientCarName; // Shtojmë emrin e veturës
                obj.ClientDocument = movementObj.ClientDocument; // Shtojmë dokumentin e klientit

            }

            return obj;
        }

        public async Task<int> OpenRoom(OpenRoomParameters parameters)
        {
            RoomMovement obj = null;
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    Console.WriteLine($"🔍 OpenRoom called with RoomNo: {parameters.RoomNo}, RoomType: {parameters.RoomType}");
                    
                    var roomDB = await _context.Rooms.FirstOrDefaultAsync(s => s.RoomNo == parameters.RoomNo && !s.IsDeleted);

                    if (roomDB is null)
                    {
                        Console.WriteLine($"❌ Room not found: {parameters.RoomNo}");
                        throw new MyException(15);
                    }
                    Console.WriteLine($"✅ Room found: {roomDB.RoomNo}, RoomModel: {roomDB.RoomModel}");

                    var typeDB = await _context.RoomTypes.FirstOrDefaultAsync(s => s.Code == parameters.RoomType);

                    if (typeDB is null)
                    {
                        Console.WriteLine($"❌ RoomType not found: {parameters.RoomType}");
                        throw new MyException(22);
                    }
                    Console.WriteLine($"✅ RoomType found: {typeDB.Code}, Description: {typeDB.Description}");

                    var userId = GetUserIdFromToken();
                    Console.WriteLine($"✅ UserId from token: {userId}");

                    obj = new RoomMovement()
                    {
                        RoomNo = parameters.RoomNo,
                        EntryOn = DateTime.Now,
                        ClientPlateNo = !string.IsNullOrWhiteSpace(parameters.ClientPlateNo) ? parameters.ClientPlateNo : null,
                        ClientDocument = !string.IsNullOrWhiteSpace(parameters.ClientDocument) ? parameters.ClientDocument : null,
                        ClientCarName = !string.IsNullOrWhiteSpace(parameters.ClientCarName) ? parameters.ClientCarName : null,
                        EnteredBy = userId,
                        EnteredOn = DateTime.Now
                    };

                    await _context.RoomMovements.AddAsync(obj);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"✅ RoomMovement created with ID: {obj.Id}");

                    var amount = await _context.RoomPrices.Where(s => s.RoomModel == roomDB.RoomModel
                                && s.RoomType == typeDB.Code).Select(s => s.Price).FirstOrDefaultAsync();
                    Console.WriteLine($"✅ RoomPrice found: {amount} for RoomModel: {roomDB.RoomModel}, RoomType: {typeDB.Code}");

                    var roomDetailObj = new RoomDetail()
                    {
                        RoomMovementId = obj.Id,
                        RoomTypeCode = parameters.RoomType,
                        Hours = typeDB.IsCustom ? parameters.Hours : typeDB.Hours,
                        Price = typeDB.IsCustom ? parameters.Price : amount,
                        IsDebt = parameters.IsDebt,
                        CashierId = parameters.IsDebt ? (int?)null : obj.EnteredBy,
                        CreatedBy = obj.EnteredBy,
                        EnteredBy = obj.EnteredBy,
                        EnteredOn = obj.EnteredOn
                    };

                    await _context.RoomDetails.AddAsync(roomDetailObj);
                    await _context.SaveChangesAsync();

                    if (parameters.IsDebt == false)
                    {
                        var message = $"{typeDB.Description} për dhomën {roomDB.Title}";

                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = roomDetailObj.Price,
                            EmployeeId = obj.EnteredBy,
                            EnteredOn = obj.EnteredOn,
                            RoomDetailsId = roomDetailObj.Id
                        });
                    }

                    await _context.SaveChangesAsync();

                    transactionScope.Complete();

                    return obj.Id;
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        public async Task<bool> AddExtraInRoom(AddExtraInRoomParameters parameters)
        {

            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (await _context.RoomMovements.AnyAsync(s => s.Id == parameters.RoomMovementId) == false)
                        throw new MyException(15);

                    var typeDB = await _context.RoomTypes.FirstOrDefaultAsync(s => s.Code == parameters.RoomType);

                    if (typeDB is null)
                        throw new MyException(22);

                    var roomDB = await (from rm in _context.RoomMovements
                                        join r in _context.Rooms on rm.RoomNo equals r.RoomNo
                                        where rm.Id == parameters.RoomMovementId
                                        select r).FirstOrDefaultAsync();


                    var enteredBy = GetUserIdFromToken();

                    var amount = await _context.RoomPrices.Where(s => s.RoomModel == roomDB.RoomModel
                            && s.RoomType == typeDB.Code).Select(s => s.Price).FirstOrDefaultAsync();

                    var roomDetailsObj = new RoomDetail()
                    {
                        RoomMovementId = parameters.RoomMovementId,
                        RoomTypeCode = parameters.RoomType,
                        Hours = typeDB.IsCustom ? parameters.Hours : typeDB.Hours,
                        Price = typeDB.IsCustom ? parameters.Price : amount,
                        IsDebt = parameters.IsDebt,
                        CashierId = parameters.IsDebt ? (int?)null : enteredBy,
                        CreatedBy = enteredBy,
                        EnteredBy = enteredBy,
                        EnteredOn = DateTime.Now
                    };

                    await _context.RoomDetails.AddAsync(roomDetailsObj);

                    await _context.SaveChangesAsync();

                    if (roomDetailsObj.IsDebt == false)
                    {
                        var message = $"{typeDB.Description} për dhomën {roomDB.Title}";

                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = roomDetailsObj.Price,
                            EmployeeId = roomDetailsObj.EnteredBy,
                            EnteredOn = roomDetailsObj.EnteredOn,
                            RoomDetailsId = roomDetailsObj.Id
                        });
                    }

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

        public async Task<bool> AddDrinkToRoom(AddDrinkToRoomParameters parameters)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    // Check if room movement exists
                    if (await _context.RoomMovements.AnyAsync(s => s.Id == parameters.RoomMovementId) == false)
                        throw new MyException(15);

                    // Check if product exists
                    var product = await _context.Products.FirstOrDefaultAsync(s => s.Code == parameters.ProductCode && !s.IsDeleted);
                    if (product == null)
                        throw new MyException(16);

                    // Get room movement details
                    var roomMovement = await _context.RoomMovements
                        .Include(rm => rm.Room)
                        .FirstOrDefaultAsync(rm => rm.Id == parameters.RoomMovementId);

                    if (roomMovement == null)
                        throw new MyException(15);

                    var enteredBy = GetUserIdFromToken();

                    // Create SupplyAndSell record for the drink
                    var supplyAndSell = new SupplyAndSell
                    {
                        DateAndTime = DateTime.Now,
                        Total = parameters.Quantity * parameters.Price,
                        IsSupply = false,
                        IsFree = false,
                        RoomMovementId = parameters.RoomMovementId,
                        IsDebt = parameters.IsDebt,
                        IsMistake = false,
                        Discount = 0,
                        EnteredBy = enteredBy,
                        EnteredOn = DateTime.Now
                    };

                    await _context.SupplyAndSells.AddAsync(supplyAndSell);
                    await _context.SaveChangesAsync();

                    // Create SupplyAndSellItem for the specific drink
                    var supplyAndSellItem = new SupplyAndSellItem
                    {
                        SupplyAndSellId = supplyAndSell.Id,
                        ProductCode = parameters.ProductCode,
                        Quantity = parameters.Quantity,
                        Price = parameters.Price,
                        CreatedBy = enteredBy,
                        CashierId = parameters.IsDebt ? (int?)null : enteredBy
                    };

                    await _context.SupplyAndSellItems.AddAsync(supplyAndSellItem);
                    await _context.SaveChangesAsync();

                    // Add payment record if not debt
                    if (!parameters.IsDebt)
                    {
                        var message = $"{product.Title} për dhomën {roomMovement.Room.Title}";
                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = supplyAndSell.Total,
                            EmployeeId = enteredBy,
                            EnteredOn = DateTime.Now
                        });
                    }

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

        public async Task<bool> Mistake(int roomMovementId)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    int minute = 0;
                    var para = await _context.Parameters.FirstOrDefaultAsync(s => s.ParameterName == "MinuteLimitForMistake");

                    if (para is not null)
                        minute = int.TryParse(para.ParameterValue, out var valMinute) ? valMinute : 0;


                    var item = await _context.RoomMovements.FirstOrDefaultAsync(s => s.Id == roomMovementId);
                    if (item is null)
                        throw new MyException(15);

                    if (minute > 0)
                    {
                        var entryUtc = item.EntryOn.Kind == DateTimeKind.Utc ? item.EntryOn : item.EntryOn.ToUniversalTime();
                        var elapsedMinutes = (int)DateTime.UtcNow.Subtract(entryUtc).TotalMinutes;
                        if (elapsedMinutes > minute)
                            throw new MyException(26);
                    }

                    var detailsIds = await _context.RoomDetails.Where(s => s.RoomMovementId == roomMovementId).Select(s => s.Id).ToListAsync();

                    var bills = await _context.SupplyAndSells.Where(s => s.RoomMovementId == item.Id).ToListAsync();

                    if (bills?.Any() ?? false)
                    {
                        foreach (var billDetails in bills)
                        {
                            billDetails.IsMistake = true;
                            billDetails.EnteredBy = GetUserIdFromToken();
                            billDetails.EnteredOn = DateTime.Now;
                        }

                        var billIds = bills.Select(s => s.Id).ToList();

                        var itemsInbill = await _context.SupplyAndSellItems.Where(s => billIds.Contains(s.SupplyAndSellId)).Select(s => s.Id).ToListAsync();

                        var payments = await _context.Payments.Where(s => (s.SupplyAndSellItemsId != null
                                && itemsInbill.Contains(s.SupplyAndSellItemsId.Value))
                                ).ToListAsync();

                        if (payments?.Any() ?? false)
                            payments.ForEach(x => x.IsMistake = true);
                    }

                    item.ClosedOn = DateTime.Now;
                    item.IsClosed = true;
                    item.IsMistake = true;

                    var paymentsRoom = await _context.Payments.Where(s => s.RoomDetailsId != null && detailsIds.Contains(s.RoomDetailsId.Value)).ToListAsync();

                    if (paymentsRoom?.Any() ?? false)
                        paymentsRoom.ForEach(x => x.IsMistake = true);

                    _context.SaveChanges();
                    transactionScope.Complete();

                    return true;
                }
                catch (Exception)
                {
                    throw;
                }
            }

        }

        public async Task<bool> ChangeRoom(int roomMovementId, string roomNo)
        {
            int minute = 0;
            var para = await _context.Parameters.FirstOrDefaultAsync(s => s.ParameterName == "MinuteLimitForChangingRoom");

            if (para is not null)
                minute = int.TryParse(para.ParameterValue, out var valMinute) ? valMinute : 0;


            var item = await _context.RoomMovements.FirstOrDefaultAsync(s => s.Id == roomMovementId);
            if (item is null)
                throw new MyException(15);

            if (minute > 0 && (int)DateTime.Now.Subtract(item.EntryOn).TotalMinutes > minute)
                throw new MyException(30);


            if (await _context.Rooms.AnyAsync(s => s.RoomNo == roomNo) == false)
                throw new MyException(15);

            item.RoomNo = roomNo;
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> ConfirmPaidForRoom(int roomMovementId)
        {

            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var item = await _context.RoomMovements.FirstOrDefaultAsync(s => s.Id == roomMovementId);
                    if (item is null)
                        throw new MyException(15);


                    decimal amount = 0;
                    var details = await _context.RoomDetails.Where(s => s.RoomMovementId == item.Id && s.IsDebt).ToListAsync();
                    if (details?.Any() ?? false)
                        amount = details.Sum(s => s.Price);

                    if (amount == 0)
                        throw new MyException(27);

                    var roomDB = await _context.Rooms.FirstOrDefaultAsync(s => s.RoomNo == item.RoomNo);


                    var lstTypes = details?.Select(s => s.RoomTypeCode).ToList() ?? new List<string>();
                    var typesDB = await _context.RoomTypes.Where(s => lstTypes.Contains(s.Code)).ToListAsync();

                    foreach (var obj in details)
                    {
                        var objType = typesDB.FirstOrDefault(s => s.Code == obj.RoomTypeCode);
                        var message = $"Konfirmim  {objType.Description} për dhomën {roomDB.Title}";

                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = obj.Price,
                            EmployeeId = obj.CreatedBy, // Përdorim ID-në e punëtorit që hapi dhomën
                            EnteredOn = obj.EnteredOn,
                            RoomDetailsId = obj.Id
                        });
                    }

                    _context.SaveChanges();
                    transactionScope.Complete();

                    return true;
                }
                catch (Exception)
                {
                    throw;
                }
            }

        }

        public async Task<bool> ConfirmAllTheDebt(int roomMovementId)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var item = await _context.RoomMovements.FirstOrDefaultAsync(s => s.Id == roomMovementId);
                    if (item is null)
                        throw new MyException(15);


                    decimal amount = 0;
                    var details = await _context.RoomDetails.Where(s => s.RoomMovementId == item.Id && s.IsDebt).ToListAsync();
                    if (details?.Any() ?? false)
                        amount += details.Sum(s => s.Price);

                    var itemsInBill = await _context.SupplyAndSells.Where(s => s.RoomMovementId == item.Id && s.IsDebt).ToListAsync();
                    if (itemsInBill?.Any() ?? false)
                        amount += itemsInBill.Sum(x => x.Total);

                    if (amount == 0)
                        throw new MyException(27);

                    var roomDB = await _context.Rooms.FirstOrDefaultAsync(s => s.RoomNo == item.RoomNo);

                    var lstTypes = details?.Select(s => s.RoomTypeCode).ToList() ?? new List<string>();
                    var typesDB = await _context.RoomTypes.Where(s => lstTypes.Contains(s.Code)).ToListAsync();

                    var moment = DateTime.Now;
                    var enteredBy = GetUserIdFromToken();

                    foreach (var obj in details)
                    {
                        var objType = typesDB.FirstOrDefault(s => s.Code == obj.RoomTypeCode);
                        var message = $"Konfirmim {objType.Description} për dhomën {roomDB.Title}";

                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = obj.Price,
                            EmployeeId = obj.CreatedBy, // Përdorim ID-në e punëtorit që hapi dhomën
                            EnteredOn = moment,
                            RoomDetailsId = obj.Id
                        });

                        obj.IsDebt = false;
                    }

                    var billsIds = itemsInBill.Select(s => s.Id).ToList();
                    var detailsInBills = await _context.SupplyAndSellItems.Where(s => billsIds.Contains(s.SupplyAndSellId)).ToListAsync();

                    var productIds = detailsInBills.Select(s => s.ProductCode).ToList();
                    var productsItems = await _context.Products.Where(s => productIds.Contains(s.Code)).ToListAsync();

                    foreach (var articleItem in detailsInBills)
                    {
                        var productObjOld = productsItems.FirstOrDefault(s => s.Code == articleItem.ProductCode);

                        var message = $"Konfirmim {articleItem.Quantity} {productObjOld?.Title ?? ""}";
                        if (roomDB is not null)
                            message += " në dhomën" + roomDB.Title;

                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = articleItem.Price * articleItem.Quantity,
                            EmployeeId = item.EnteredBy, // Përdorim ID-në e punëtorit që hapi dhomën
                            EnteredOn = moment,
                            SupplyAndSellItemsId = articleItem.Id
                        });                 
                    }

                    if (itemsInBill?.Any() ?? false)
                        itemsInBill.ForEach(x => x.IsDebt = false);

                    _context.SaveChanges();
                    transactionScope.Complete();

                    return true;
                }
                catch (Exception)
                {
                    throw;
                }
            }

        }

        public async Task<string> GetConfirmMessage(int roomMovementId)
        {
            var item = await _context.RoomMovements.FirstOrDefaultAsync(s => s.Id == roomMovementId);
            if (item is null)
                throw new MyException(15);

            decimal amount = 0;
            var details = await _context.RoomDetails.Where(s => s.RoomMovementId == item.Id && s.IsDebt).ToListAsync();
            if (details?.Any() ?? false)
                amount += details.Sum(s => s.Price);

            var itemsInBill = await _context.SupplyAndSells.Where(s => s.RoomMovementId == item.Id && s.IsDebt).ToListAsync();
            if (itemsInBill?.Any() ?? false)
                amount += itemsInBill.Sum(x => x.Total);

            var messageDB = await _context.Messages.Where(s => s.Code == "28").Select(s => s.Message).FirstOrDefaultAsync();

            return messageDB?.Replace("{0}", amount.ToString("0.##")) ?? "";
        }

        public async Task<bool> CloseRoom(int roomMovementId)
        {
            using (TransactionScope transactionScope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var item = await _context.RoomMovements.FirstOrDefaultAsync(s => s.Id == roomMovementId);
                    if (item is null)
                        throw new MyException(15);


                    decimal amount = 0;
                    var details = await _context.RoomDetails.Where(s => s.RoomMovementId == item.Id && s.IsDebt).ToListAsync();
                    if (details?.Any() ?? false)
                    {
                        amount += details.Sum(s => s.Price);
                        details.ForEach(x => x.IsDebt = false);
                    }

                    var itemsInBill = await _context.SupplyAndSells.Where(s => s.RoomMovementId == item.Id && s.IsDebt).ToListAsync();
                    if (itemsInBill?.Any() ?? false)
                    {
                        amount += itemsInBill.Sum(x => x.Total);
                        itemsInBill.ForEach(x => x.IsDebt = false);
                    }

                    var roomDB = await _context.Rooms.FirstOrDefaultAsync(s => s.RoomNo == item.RoomNo);

                    var lstTypes = details?.Select(s => s.RoomTypeCode).ToList() ?? new List<string>();
                    var typesDB = await _context.RoomTypes.Where(s => lstTypes.Contains(s.Code)).ToListAsync();

                    var moment = DateTime.Now;
                    var enteredBy = GetUserIdFromToken();

                    foreach (var obj in details)
                    {
                        var objType = typesDB.FirstOrDefault(s => s.Code == obj.RoomTypeCode);
                        var message = $"Konfirmim në mbyllje {objType.Description} për dhomën {roomDB.Title}";

                        Console.WriteLine($"💰 Creating payment: {message}, Amount: {obj.Price}, EmployeeId: {obj.CreatedBy}");

                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = obj.Price,
                            EmployeeId = obj.CreatedBy, // Përdorim ID-në e punëtorit që hapi dhomën
                            EnteredOn = moment,
                            RoomDetailsId = obj.Id
                        });
                    }

                    
                    var billsIds = itemsInBill.Select(s => s.Id).ToList();
                    var detailsInBills = await _context.SupplyAndSellItems.Where(s => billsIds.Contains(s.SupplyAndSellId)).ToListAsync();

                    var productIds = detailsInBills.Select(s => s.ProductCode).ToList();
                    var productsItems = await _context.Products.Where(s => productIds.Contains(s.Code)).ToListAsync();

                    foreach (var articleItem in detailsInBills)
                    {
                        articleItem.CashierId = enteredBy;
                        var productObjOld = productsItems.FirstOrDefault(s => s.Code == articleItem.ProductCode);

                        var message = $"Konfirmim në mbyllje {articleItem.Quantity} {productObjOld?.Title ?? ""}";
                        if (roomDB is not null)
                            message += " në dhomën" + roomDB.Title;

                        await _context.Payments.AddAsync(new Payment
                        {
                            DisplayText = message,
                            Amount = articleItem.Price * articleItem.Quantity,
                            EmployeeId = item.EnteredBy, // Përdorim ID-në e punëtorit që hapi dhomën
                            EnteredOn = moment,
                            SupplyAndSellItemsId = articleItem.Id
                        });
                    }

                    _context.SaveChanges();

                    item.IsClosed = true;
                    item.ClosedOn = moment;
                    item.EnteredBy = enteredBy;
                    item.EnteredOn = moment;

                    _context.SaveChanges();
                    transactionScope.Complete();

                    return true;
                }
                catch (Exception)
                {
                    throw;
                }
            }

        }

        public async Task<DetailsOfOpenRoomDTO> GetRoomDetails(int roomMovementId)
        {
            var item = new DetailsOfOpenRoomDTO();

            var movementObj = await (from rm in _context.RoomMovements
                                     join r in _context.Rooms on rm.RoomNo equals r.RoomNo
                                     where rm.Id == roomMovementId
                                     select new
                                     {
                                         rm.Id,
                                         r.RoomNo,
                                         r.Title,
                                         rm.ClientPlateNo,
                                         rm.ClientDocument,
                                         rm.ClientCarName,
                                         rm.EntryOn

                                     }).FirstOrDefaultAsync();

            if (movementObj is null)
                throw new MyException(4);

            item.RoomMovementId = movementObj.Id;
            item.RoomNo = movementObj.RoomNo;
            item.RoomTitle = movementObj.Title;
            item.ClientPlateNo = movementObj.ClientPlateNo;
            item.ClientDocument = movementObj.ClientDocument;
            item.ClientCarName = movementObj.ClientCarName;
            item.StartTime = movementObj.EntryOn.ToString("dd.MM.yyyy HH:mm");
            var diffTime = DateTime.Now.Subtract(movementObj.EntryOn);
            item.SpendTime = $"{ (int)diffTime.Days } - {((int)diffTime.Hours).ToString("00")}:{((int)diffTime.Minutes).ToString("00")}";

            var detailsItems = await (from rd in _context.RoomDetails
                                 join rt in _context.RoomTypes on rd.RoomTypeCode equals rt.Code
                                 where rd.RoomMovementId == movementObj.Id
                                 select new 
                                 {
                                     Id = rd.Id, 
                                     Title = rt.Description,
                                     rd.Price,
                                     rd.IsDebt,
                                     rt.IsExtra
                                 }).ToListAsync();

            item.RoomTypeDescription = detailsItems.OrderByDescending(s => s.Id).Select(s => s.Title).FirstOrDefault() ?? "";
            int counter = 0;
            foreach (var objExtra in detailsItems)
            {
                if(objExtra.IsExtra)
                {
                    item.Extras += counter > 0 ? "," : "";

                    counter++;

                    item.Extras += objExtra.IsDebt ? "-" : "+" + objExtra.Price;
                }
            }

            var articlesItems = await _context.SupplyAndSells.Where(s => s.RoomMovementId == movementObj.Id).ToListAsync();

            item.RoomDebt = detailsItems.Where(x => x.IsDebt).Sum(x => x.Price);
            item.MarketDebt = articlesItems.Where(s => s.IsDebt).Sum(s => s.Total);
            item.GratisAmount = articlesItems.Where(s => s.IsFree).Sum(s => s.Total);
            item.RoomAmount = detailsItems.Sum(x => x.Price);
            item.MarketAmount = articlesItems.Sum(s => s.Total);
            item.Total = item.RoomAmount + item.MarketAmount;

            return item;
        }

    }
}
