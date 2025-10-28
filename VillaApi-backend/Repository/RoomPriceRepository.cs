using Microsoft.EntityFrameworkCore;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class RoomPriceRepository : BaseRepository, IRoomPriceRepository
    {
        public RoomPriceRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<RoomPriceDTO>?> GetAll()
        {
            var items = await (from s in _context.RoomPrices
                               join t in _context.RoomTypes on s.RoomType equals t.Code
                               join m in _context.RoomModels on s.RoomModel equals m.Code
                               join p in _context.Users on s.EnteredBy equals p.Id
                               select new RoomPriceDTO
                               {
                                   Id = s.Id,
                                   RoomModel = s.RoomModel,
                                   RoomModelTitle = m.Description,
                                   RoomType = s.RoomType,
                                   RoomTypeTitle = t.Description,
                                   Price = s.Price,
                                   EnteredBy = p.Username,
                                   EnteredOn = s.EnteredOn

                               }).ToListAsync();

            return items;
        }

        public async Task<RoomPriceDTO?> GetItem(int id)
        {
            var items = await (from s in _context.RoomPrices
                               join t in _context.RoomTypes on s.RoomType equals t.Code
                               join m in _context.RoomModels on s.RoomModel equals m.Code
                               join p in _context.Users on s.EnteredBy equals p.Id
                               where s.Id == id
                               select new RoomPriceDTO
                               {
                                   Id = s.Id,
                                   RoomModel = s.RoomModel,
                                   RoomModelTitle = m.Description,
                                   RoomType = s.RoomType,
                                   RoomTypeTitle = t.Description,
                                   Price = s.Price,
                                   EnteredBy = p.Username,
                                   EnteredOn = s.EnteredOn

                               }).FirstOrDefaultAsync();

            return items;
        }

        public async Task<RoomPriceDTO?> GetItemByTypeAndModel(string type, string model)
        {
            var items = await (from s in _context.RoomPrices
                               join t in _context.RoomTypes on s.RoomType equals t.Code
                               join m in _context.RoomModels on s.RoomModel equals m.Code
                               join p in _context.Users on s.EnteredBy equals p.Id
                               where s.RoomType == type && s.RoomModel == model
                               select new RoomPriceDTO
                               {
                                   Id = s.Id,
                                   RoomModel = s.RoomModel,
                                   RoomModelTitle = m.Description,
                                   RoomType = s.RoomType,
                                   RoomTypeTitle = t.Description,
                                   Price = s.Price,
                                   EnteredBy = p.Username,
                                   EnteredOn = s.EnteredOn

                               }).FirstOrDefaultAsync();

            return items;
        }

        public async Task<bool> Add(RoomPriceParameters parameters)
        {
            if (await _context.RoomPrices.AnyAsync(s =>  s.RoomModel == parameters.RoomModel 
                                                    && s.RoomType == parameters.RoomType))
                throw new MyException(20);


            if (await _context.RoomModels.AnyAsync(s => s.Code == parameters.RoomModel) == false)
                throw new MyException(21);

            if (await _context.RoomTypes.AnyAsync(s => s.Code == parameters.RoomType) == false)
                throw new MyException(22);

            await _context.RoomPrices.AddAsync(new RoomPrice
            {
                RoomModel = parameters.RoomModel,
                RoomType = parameters.RoomType,
                Price = parameters.Price,
                EnteredBy = GetUserIdFromToken(),
                EnteredOn = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Update(int id, decimal price)
        {
            var item = await _context.RoomPrices.FirstOrDefaultAsync(s => s.Id == id);

            if (item is null)
                throw new MyException(4);


            item.Price = price;
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(int id)
        {
            var item = await _context.RoomPrices.FirstOrDefaultAsync(s => s.Id == id);

            if (item is null)
                throw new MyException(4);

            try
            {
                _context.RoomPrices.Remove(item);

                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw new MyException(19);
            }

            return true;
        }


    }
}