using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VillaApi.Utils;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [AllowAnonymous]
    public class InitialzeDBController : Controller
    {
        private readonly SeedData seedData;

        public InitialzeDBController(SeedData mySeedData)
        {
            seedData = mySeedData;
        }

        [HttpPost]
        public async Task<ResponseDTO?> Start(string password)
        {
            if (string.IsNullOrWhiteSpace(password)
                || !password.Equals("Gallapeni125#"))
                return new ResponseDTO
                {
                    IsSuccessfull = true,
                    Data = "passwordi gabim"
                };

            await seedData.AddParameters(); 
            await seedData.AddMessages();
            await seedData.AdminUser();

            await seedData.AddRoomTypes();

            await seedData.AddRooms("Standart", new List<string>
            {
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
                "13",
                "14",
                "15",
                "16",
                "17"
            }, new List<SeedData.RoomPriceSeedData>
            {
                new SeedData.RoomPriceSeedData(){Type = "P", Price = 15},
                new SeedData.RoomPriceSeedData(){Type = "F", Price = 25},
                new SeedData.RoomPriceSeedData(){Type = "24h", Price = 40},
                new SeedData.RoomPriceSeedData(){Type = "VP", Price = 15},
                new SeedData.RoomPriceSeedData(){Type = "VF", Price = 25},

            });

            await seedData.AddRooms("Vip 1", new List<string> { "Vip 1" },
                new List<SeedData.RoomPriceSeedData> 
                {
                    new SeedData.RoomPriceSeedData(){Type = "P", Price = 15},
                    new SeedData.RoomPriceSeedData(){Type = "F", Price = 25},
                    new SeedData.RoomPriceSeedData(){Type = "24h", Price = 40},
                    new SeedData.RoomPriceSeedData(){Type = "VP", Price = 15},
                    new SeedData.RoomPriceSeedData(){Type = "VF", Price = 25},
                }, orderStartFrom: 18);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = "Migrimi u kry me sukses"
            };
        }
    }
}
