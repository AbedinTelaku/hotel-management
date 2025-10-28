using Mapster;
using Microsoft.EntityFrameworkCore;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class RoomModelRepository : BaseRepository, IRoomModelRepository
    {
        public RoomModelRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public string GenereateCode()
        {
            int code = 0;

            if (_context.RoomModels.Any())
            {
                code = _context.RoomModels.Select(x => x.Code).ToList().Select(s => new
                {
                    Value = int.TryParse(s, out int _val) ? _val : 0
                }).Max(x => x.Value);
            }

            return (code + 1).ToString("00");
        }

        public async Task<IEnumerable<RoomModelDTO>?> GetAll()
        {
            var items = await _context.RoomModels.ToListAsync();

            return items.Adapt<IEnumerable<RoomModel>, IEnumerable<RoomModelDTO>>();
        }

        public async Task<bool> Add(string title)
        {
            if (await _context.RoomModels.AnyAsync(s => s.Description == title))
                throw new MyException(17);

            await _context.RoomModels.AddAsync(new RoomModel
            {
                Code = GenereateCode(),
                Description = title
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Update(RoomModelDTO parameters)
        {
            var item = await _context.RoomModels.FirstOrDefaultAsync(s => s.Code == parameters.Code);

            if (item is null)
                throw new MyException(4);

            if (await _context.RoomModels.AnyAsync(s => s.Code != parameters.Code && s.Description == parameters.Description))
                throw new MyException(17);

            item.Description = parameters.Description;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(string code)
        {
            var item = await _context.RoomModels.FirstOrDefaultAsync(s => s.Code == code);

            if (item is null)
                throw new MyException(4);

            try
            {
                _context.RoomModels.Remove(item);

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
