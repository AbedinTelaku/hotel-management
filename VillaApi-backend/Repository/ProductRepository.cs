using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class ProductRepository : BaseRepository, IProductRepository
    {
        public ProductRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public string GenereateCode()
        {
            int code = 0;

            if (_context.Products.Any())
            {
                code = _context.Products.Select(x => x.Code).ToList().Select(s => new
                {
                    Value = int.TryParse(s, out int _val) ? _val : 0
                }).Max(x => x.Value);
            }

            return (code + 1).ToString("000");
        }
        public async Task<IEnumerable<ProductDTO>?> GetAll()
        {
            var items = from p in _context.Products
                        join c in _context.ProductCategories on p.Category equals c.Code
                        join u in _context.Users on p.EnteredBy equals u.Id
                        where !p.IsDeleted
                        select new ProductDTO
                        {
                            Code = p.Code,
                            Title = p.Title,
                            Category = c.Code,
                            CategoryTitle = c.Description,
                            Price = p.Price,
                            IsActive = p.IsActive,
                            Stock = p.Stock, // Include stock in DTO
                            EnteredOn = p.EnteredOn,
                            EnteredBy = u.Username,
                            Image = p.Image,
                            ImageFormat = p.ImageFormat,
                            OrderNo = p.OrderNo
                        };

            return await items.OrderBy(s => s.Category).ThenBy(s => s.OrderNo).ToListAsync();
        }

        public async Task<IEnumerable<ProductDTO>?> GetByCategory(string category)
        {
            var items = from p in _context.Products
                        join c in _context.ProductCategories on p.Category equals c.Code
                        join u in _context.Users on p.EnteredBy equals u.Id
                        where !p.IsDeleted && p.IsActive && c.Code == category
                        select new ProductDTO
                        {
                            Code = p.Code,
                            Title = p.Title,
                            Category = c.Code,
                            CategoryTitle = c.Description,
                            Price = p.Price,
                            IsActive = p.IsActive,
                            Stock = p.Stock, // Include stock in DTO
                            EnteredOn = p.EnteredOn,
                            EnteredBy = u.Username,
                            Image = p.Image,
                            ImageFormat = p.ImageFormat,
                            OrderNo = p.OrderNo
                        };

            return await items.OrderBy(s => s.OrderNo).ToListAsync();
        }

        public async Task<ProductDTO?> GetByCode(string code)
        {
            var items = from p in _context.Products
                        join c in _context.ProductCategories on p.Category equals c.Code
                        join u in _context.Users on p.EnteredBy equals u.Id
                        where !p.IsDeleted && p.Code == code
                        select new ProductDTO
                        {
                            Code = p.Code,
                            Title = p.Title,
                            Category = c.Code,
                            CategoryTitle = c.Description,
                            Price = p.Price,
                            IsActive = p.IsActive,
                            Stock = p.Stock, // Include stock in DTO
                            EnteredOn = p.EnteredOn,
                            EnteredBy = u.Username,
                            Image = p.Image,
                            ImageFormat = p.ImageFormat
                        };

            return await items.FirstOrDefaultAsync();
        }

        public async Task<bool> Add(ProductParameters parameters)
        {
            //var item = await _context.Products.FirstOrDefaultAsync(s => s.Code == parameters.Code);

            //if (item is not null)
            //    throw new MyException(item.IsDeleted ? 13 : 5);

            if(await _context.ProductCategories.AnyAsync(s => s.Code == parameters.Category && !s.IsDeleted) == false)
                throw new MyException(14);

            await _context.Products.AddAsync(new Product
            {
                Code = GenereateCode(),
                Title = parameters.Title,
                IsActive = parameters.IsActive,
                Category = parameters.Category,
                Price = parameters.Price,
                Stock = parameters.Stock, // Set initial stock
                EnteredBy = GetUserIdFromToken(),
                EnteredOn = DateTime.Now,
                Image = parameters.Image,
                ImageFormat = parameters.ImageFormat,
                OrderNo = parameters.OrderNo
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Update(ProductParameters parameters)
        {
            var item = await _context.Products.FirstOrDefaultAsync(s => s.Code == parameters.Code && !s.IsDeleted);

            if (item is null)
                throw new MyException(4);

            if (await _context.ProductCategories.AnyAsync(s => s.Code == parameters.Category && !s.IsDeleted) == false)
                throw new MyException(14);

            item.Title = parameters.Title;
            item.Category = parameters.Category;
            item.Price = parameters.Price;
            item.IsActive = parameters.IsActive;
            item.Stock = parameters.Stock; // Update stock value
            item.EnteredBy = GetUserIdFromToken();
            item.EnteredOn = DateTime.Now;
            item.Image = parameters.Image;
            item.ImageFormat = parameters.ImageFormat;
            item.OrderNo = parameters.OrderNo;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(string code)
        {
            var item = await _context.Products.FirstOrDefaultAsync(s => s.Code == code && !s.IsDeleted);

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
            return await _context.Products.AnyAsync(s => s.Title == title && !s.IsDeleted && (code == null || s.Code != code));
        }

    }
}
