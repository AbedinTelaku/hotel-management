using Azure.Core;
using Mapster;
using Microsoft.EntityFrameworkCore;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class ProductCategoryRepository : BaseRepository, IProductCategoryRepository
    {
        public ProductCategoryRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public string GenereateCode()
        {
            int code = 0;

            if (_context.ProductCategories.Any())
            {
                code = _context.ProductCategories.Select(x => x.Code).ToList().Select(s => new
                {
                    Value = int.TryParse(s, out int _val) ? _val : 0
                }).Max(x => x.Value);
            }

            return (code + 1).ToString("000");
        }

        public async Task<IEnumerable<ProductCategoryDTO>?> GetAll()
        {
            var items = from c in _context.ProductCategories
                        join p in _context.Users on c.EnteredBy equals p.Id
                        where c.IsDeleted == false
                        select new ProductCategoryDTO
                        {
                            Code = c.Code,
                            Description = c.Description,
                            IsActive = c.IsActive,
                            EnteredBy = p.Username,
                            EnteredOn = c.EnteredOn
                        };

            return await items.ToListAsync();
        }

        public async Task<IEnumerable<ProductCategoryDTO>?> GetActiveItems()
        {
            var items = await _context.ProductCategories
                            .Where(s => s.IsActive)
                            .ToListAsync();

            return items.Adapt<List<ProductCategory>, List<ProductCategoryDTO>>().AsEnumerable();
        }

        public async Task<bool> Add(ProductCategoryParameters categoryParameters)
        {
            //var item = await _context.ProductCategories.FirstOrDefaultAsync(s => s.Code == categoryParameters.Code);

            //if (item is not null)
            //    throw new MyException(item.IsDeleted ? 13 : 5);

            await _context.ProductCategories.AddAsync(new ProductCategory
            {
                Code = GenereateCode(),
                Description = categoryParameters.Description,
                IsActive = categoryParameters.IsActive,
                EnteredBy = GetUserIdFromToken(),
                EnteredOn = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Update(ProductCategoryParameters categoryParameters)
        {
            var item = await _context.ProductCategories.FirstOrDefaultAsync(s => s.Code == categoryParameters.Code && !s.IsDeleted);

            if (item is null)
                throw new MyException(4);

            item.Description = categoryParameters.Description;
            item.IsActive = categoryParameters.IsActive;
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(string code)
        {
            var item = await _context.ProductCategories.FirstOrDefaultAsync(s => s.Code == code && !s.IsDeleted);

            if (item is null)
                throw new MyException(4);

            item.IsDeleted = true;
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> HasItemWithSameTitle(string title, string? code = null)
        {
            return await _context.ProductCategories.AnyAsync(s => s.Description == title && !s.IsDeleted && (code == null || s.Code != code));
        }

    }
}
