using Microsoft.EntityFrameworkCore;
using VillaApi.Dtos;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class RoomTypeRepository : BaseRepository, IRoomTypeRepository
    {
        public RoomTypeRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public string GenereateCode()
        {
            int code = 0;

            if (_context.RoomTypes.Any())
            {
                code = _context.RoomTypes.Select(x => x.Code).ToList().Select(s => new
                {
                    Value = int.TryParse(s, out int _val) ? _val : 0
                }).Max(x => x.Value);
            }

            return (code + 1).ToString("00");
        }

        public async Task<IEnumerable<RoomTypeDTO>?> GetAll()
        {
            var items = await (from s in _context.RoomTypes
                               join p in _context.Users on s.EnteredBy equals p.Id
                               select new RoomTypeDTO
                               {
                                   Code = s.Code,
                                   Description = s.Description,
                                   Hours = s.Hours,
                                   IsCustom = s.IsCustom,
                                   IsExtra = s.IsExtra,
                                   OrderNo = s.OrderNo,
                                   EnteredBy = p.Username,
                                   EnteredOn = s.EnteredOn

                               }).ToListAsync();

            return items;
        }

        public async Task<bool> Add(RoomTypeDTO parameters)
        {
            if (await _context.RoomTypes.AnyAsync(s => s.Description == parameters.Description))
                throw new MyException(18);

            await _context.RoomTypes.AddAsync(new RoomType
            {
                Code = GenereateCode(),
                Description = parameters.Description,
                Hours = parameters.Hours,
                IsCustom = parameters.IsCustom,
                IsExtra = parameters.IsExtra,
                OrderNo = parameters.OrderNo,
                EnteredBy = GetUserIdFromToken(),
                EnteredOn = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Update(RoomTypeDTO parameters)
        {
            var item = await _context.RoomTypes.FirstOrDefaultAsync(s => s.Code == parameters.Code);

            if (item is null)
                throw new MyException(4);

            if (await _context.RoomTypes.AnyAsync(s => s.Code != parameters.Code && s.Description == parameters.Description))
                throw new MyException(17);

            item.Description = parameters.Description;
            item.Hours = parameters.Hours;
            item.IsCustom = parameters.IsCustom;
            item.IsExtra = parameters.IsExtra;
            item.OrderNo = parameters.OrderNo;
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(string code)
        {
            var item = await _context.RoomTypes.FirstOrDefaultAsync(s => s.Code == code);

            if (item is null)
                throw new MyException(4);

            try
            {
                _context.RoomTypes.Remove(item);

                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw new MyException(19);
            }

            return true;
        }

        public async Task<IEnumerable<RoomTypeWithPriceDTO>?> GetBasic(string roomModel)
        {
            var items = await (from s in _context.RoomTypes
                               join p in _context.RoomPrices on s.Code equals p.RoomType
                               where !s.IsExtra && p.RoomModel == roomModel
                               select new RoomTypeWithPriceDTO
                               {
                                   Code = s.Code,
                                   Description = s.Description,
                                   Hours = s.Hours,
                                   IsCustom = s.IsCustom,
                                   Price = p.Price,
                                   OrderNo = s.OrderNo

                               }).Distinct().OrderBy(s => s.OrderNo).ToListAsync();

            return items;
        }

        public async Task<IEnumerable<RoomTypeWithPriceDTO>?> GetExtras(string roomModel)
        {
            var items = await (from s in _context.RoomTypes
                               join p in _context.RoomPrices on s.Code equals p.RoomType
                               where s.IsExtra && p.RoomModel == roomModel
                               select new RoomTypeWithPriceDTO
                               {
                                   Code = s.Code,
                                   Description = s.Description,
                                   Hours = s.Hours,
                                   IsCustom = s.IsCustom,
                                   Price = p.Price,
                                   OrderNo= s.OrderNo
                               }).Distinct().OrderBy(s => s.OrderNo).ToListAsync();

            return items;
        }

    }
}