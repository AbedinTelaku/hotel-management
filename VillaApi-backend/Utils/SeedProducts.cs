using VillaApi.Models;

namespace VillaApi.Utils
{
    public static class SeedProducts
    {
        public static async Task SeedProductsData(MyDbContext context)
        {
            // Check if products already exist
            if (context.Products.Any())
                return;

            var products = new List<Product>
            {
                // Pije të Ftohta
                new Product
                {
                    Code = "P001",
                    Title = "Coca Cola",
                    Category = "001", // Pije të Ftohta
                    Price = 2.50m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 1,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P002",
                    Title = "Pepsi",
                    Category = "001",
                    Price = 2.50m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 2,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P003",
                    Title = "Fanta",
                    Category = "001",
                    Price = 2.50m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 3,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P004",
                    Title = "Sprite",
                    Category = "001",
                    Price = 2.50m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 4,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P005",
                    Title = "Ujë Mineral",
                    Category = "001",
                    Price = 1.50m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 5,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                
                // Pije të Nxehta
                new Product
                {
                    Code = "P006",
                    Title = "Kafe",
                    Category = "002", // Pije të Nxehta
                    Price = 3.00m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 1,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P007",
                    Title = "Çaj",
                    Category = "002",
                    Price = 2.00m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 2,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P008",
                    Title = "Kakao",
                    Category = "002",
                    Price = 2.50m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 3,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                
                // Alkool
                new Product
                {
                    Code = "P009",
                    Title = "Birrë",
                    Category = "003", // Alkool
                    Price = 4.00m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 1,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P010",
                    Title = "Raki",
                    Category = "003",
                    Price = 5.00m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 2,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                
                // Ushqim
                new Product
                {
                    Code = "P011",
                    Title = "Sandwich",
                    Category = "004", // Ushqim
                    Price = 8.00m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 1,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P012",
                    Title = "Pizza",
                    Category = "004",
                    Price = 12.00m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 2,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                
                // Snacks
                new Product
                {
                    Code = "P013",
                    Title = "Chips",
                    Category = "005", // Snacks
                    Price = 3.50m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 1,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                },
                new Product
                {
                    Code = "P014",
                    Title = "Çokollatë",
                    Category = "005",
                    Price = 2.00m,
                    IsActive = true,
                    IsDeleted = false,
                    OrderNo = 2,
                    EnteredBy = 1,
                    EnteredOn = DateTime.Now
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
}
