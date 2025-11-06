using Microsoft.EntityFrameworkCore;
using VillaApi.Models;

namespace VillaApi
{
    public partial class MyDbContext : DbContext
    {
        public MyDbContext()
        {
        }

        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
        {

        }

        public DbSet<Users> Users { get; set; }
        public DbSet<LoginToken> LoginTokens { get; set; }  
        public DbSet<BlockToken> BlockTokens { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Product> Products { get; set; }

        public DbSet<Capability> Capabilities { get; set; }
        public DbSet<FormCapability> FormCapabilities { get; set; }
        public DbSet<FormAuthorization> FormAuthorizations { get; set; }

        public DbSet<RoomModel> RoomModels { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<RoomPrice> RoomPrices { get; set; }
        public DbSet<RoomDetail> RoomDetails { get; set; }
        public DbSet<RoomMovement> RoomMovements { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<SuggestionCarName> SuggestionCarNames { get; set; }
        public DbSet<SupplyAndSell> SupplyAndSells { get; set; }
        public DbSet<SupplyAndSellItem> SupplyAndSellItems { get; set; }

        public DbSet<Messages> Messages { get; set; }
        public DbSet<Parameters> Parameters { get; set; }
        public DbSet<Payment> Payments { get; set; }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);

            var mybuilder = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false);

            IConfiguration myConfiguration = mybuilder.Build();

            optionsBuilder.UseSqlServer(myConfiguration.GetValue<string>("ConnectionStrings:MyDatabase"));
        }

    }
}
