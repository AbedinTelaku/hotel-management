using VillaApi.Models;
using VillaApi.Repository;

namespace VillaApi.Utils
{
    public static class SeedProductCategories
    {
        public static async Task SeedCategories(MyDbContext context)
        {
            // Check if categories already exist
            if (context.ProductCategories.Any())
                return;

            var categories = new List<ProductCategory>
            {
                new ProductCategory
                {
                    Code = "001",
                    Description = "Pije të Ftohta",
                    IsActive = true,
                    IsDeleted = false,
                    EnteredBy = 1, // Admin user ID
                    EnteredOn = DateTime.Now
                },
                new ProductCategory
                {
                    Code = "002", 
                    Description = "Pije të Nxehta",
                    IsActive = true,
                    IsDeleted = false,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new ProductCategory
                {
                    Code = "003",
                    Description = "Alkool",
                    IsActive = true,
                    IsDeleted = false,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new ProductCategory
                {
                    Code = "004",
                    Description = "Ushqim",
                    IsActive = true,
                    IsDeleted = false,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new ProductCategory
                {
                    Code = "005",
                    Description = "Snacks",
                    IsActive = true,
                    IsDeleted = false,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                }
            };

            await context.ProductCategories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }
    }
}
