using Microsoft.EntityFrameworkCore;
using System;
using VillaApi.Models;

namespace VillaApi.Utils
{
    public class SeedData
    {
        private int UserId;
        private readonly DateTime Moment;
        private readonly MyDbContext context;
        public SeedData(MyDbContext myDbContext)
        {
            context = myDbContext;
            Moment = DateTime.Now;
        }

        public async Task AdminUser()
        {
            var adminItem = await context.Users.FirstOrDefaultAsync(x => x.Username == "admin");

            if (adminItem is not null)
            {
                UserId = adminItem.Id;
                return;
            }

            adminItem = new Users
            {
                Username = "admin",
                Password = BCrypt.Net.BCrypt.HashPassword("admin"),
                IsActive = true,
                IsAdmin = true,
            };

            await context.Users.AddAsync(adminItem);

            await context.SaveChangesAsync();

            UserId = adminItem.Id;
        }
        public async Task AddMessages()
        {
            await context.Messages.AddRangeAsync(new List<Messages>
                {
                    new Messages { Code = "1", Message = "Shënimi u ruajt me sukses" },
            new Messages { Code = "2", Message = "Shënimi u ndryshua me sukses" },
            new Messages { Code = "3", Message = "Shënimi u fshi me sukses" },
            new Messages { Code = "4", Message = "Shënimi nuk u gjetë" },
            new Messages { Code = "5", Message = "Ky shënim tashmë ekziston" },
            new Messages { Code = "6", Message = "{0} nuk mund të jetë më i gjatë se {1} karaktere" },
            new Messages { Code = "7", Message = "Ky përdorues ekziston. Ju lutem zgjedhni një të ri" },
            new Messages { Code = "8", Message = "Ky përdorues nuk ekziston" },
            new Messages { Code = "9", Message = "Fjalëkalimi nuk është i saktë" },
            new Messages { Code = "10", Message = "Përdoruesi nuk është aktiv" },
            new Messages { Code = "11", Message = "Gabim në lexim të tokenit. Ju lutem kyçuni përsëri" },
            new Messages { Code = "12", Message = "Ju ka përfunduar sesioni. Ju lutem kyçuni përsëri" },
            new Messages { Code = "13", Message = "Ky kod nuk mund të perdoret pasi është përdorur në shenim të tjera" },
            new Messages { Code = "14", Message = "Kategoria e produktit nuk ekziston, ju lutem zgjedhni një kategori tjetër" },
            new Messages { Code = "15", Message = "Gabim. Dhoma e zgjedhur nuk ekziston" },
            new Messages { Code = "16", Message = "Lista e produkteve përmban produkte të cilat nuk ekzistojnë" },
            new Messages { Code = "17", Message = "Ky model për dhomë ekziston, ju lutem zgjedhni një model të ri" },
            new Messages { Code = "18", Message = "Ky lloje për dhomë ekziston, ju lutem zgjedhni një lloje të ri" },
            new Messages { Code = "19", Message = "Nuk mund të fshini shënimin pasi është përdorur në shënime të tjera" },
            new Messages { Code = "20", Message = "Çmimi për këtë dhomë me këtë model dhe lloje është regjistruar, ju mundeni të ndryshoni" },
            new Messages { Code = "21", Message = "Gabim. Nuk ekziston ky model për këtë dhomë" },
            new Messages { Code = "22", Message = "Gabim. Nuk ekziston ky lloje për këtë dhomë" },
            new Messages { Code = "23", Message = "Kjo dhomë ekziston, ju lutem zgjedhni një titull të ri" },
            new Messages { Code = "24", Message = "Dhoma e zgjedhur është e mbyllur. Prandaj nuk mund të shtohen artikuj të tjerë në faturë për këtë dhomë" },
            new Messages { Code = "25", Message = "Klienti nuk ka artikuj borxh" },
            new Messages { Code = "26", Message = "Nuk mund të e mbyllni dhomën si gabim sepse ka kaluar kohën e cila lejohet për mbyllje si gabim" },
            new Messages { Code = "27", Message = "Nuk mund të konfirmoni pagesë për dhomën sepse dhoma nuk ka borxhe" },
            new Messages { Code = "28", Message = "Dhoma ka gjithsej borxh në vlerën {0}. A dëshironi të konfirmoni pagesën?" },
            new Messages { Code = "29", Message = "Nuk ka shënim për konfirmim" },
            new Messages { Code = "30", Message = "Nuk mund të e ndërroni dhomën sepse ka kaluar kohën e cila lejohet për ndërrim të dhomës" }

                });

            await context.SaveChangesAsync();

        }       
        public async Task AddParameters()
        {
          await  context.Parameters.AddRangeAsync(new List<Parameters>
                {
                    new Parameters{ParameterName = "CanSeeWallet", ParameterValue = "false"},
                    new Parameters{ParameterName = "MinuteLimitForChangingRoom", ParameterValue = "5"},
                    new Parameters{ParameterName = "MinuteLimitForMistake", ParameterValue = "5"}
                });

           await context.SaveChangesAsync();

        }
        public async Task AddRoomTypes()
        {
            await context.RoomTypes.AddAsync(new RoomType
            {
                Code = "24h",
                Description = "24 orë",
                Hours = 24,
                IsCustom = false,
                IsExtra = false,
                EnteredBy = UserId,
                OrderNo = 2,
                EnteredOn = Moment
            });

            await context.RoomTypes.AddAsync(new RoomType
            {
                Code = "F",
                Description = "Fjetje",
                Hours = 12,
                IsCustom = false,
                IsExtra = false,
                EnteredBy = UserId,
                OrderNo = 2,
                EnteredOn = Moment
            });

            await context.RoomTypes.AddAsync(new RoomType
            {
                Code = "P",
                Description = "Pushim",
                Hours = 3,
                IsCustom = false,
                IsExtra = false,
                EnteredBy = UserId,
                OrderNo = 2,
                EnteredOn = Moment
            });

            await context.RoomTypes.AddAsync(new RoomType
            {
                Code = "T",
                Description = "Tjetër",
                Hours = 0,
                IsCustom = true,
                IsExtra = false,
                EnteredBy = UserId,
                OrderNo = 2,
                EnteredOn = Moment
            });

            await context.RoomTypes.AddAsync(new RoomType
            {
                Code = "VF",
                Description = "Vazhdim fjetje",
                Hours = 12,
                IsCustom = false,
                IsExtra = true,
                EnteredBy = UserId,
                OrderNo = 2,
                EnteredOn = Moment
            });

            await context.RoomTypes.AddAsync(new RoomType
            {
                Code = "VP",
                Description = "Vazhdim pushim",
                Hours = 3,
                IsCustom = false,
                IsExtra = true,
                EnteredBy = UserId,
                OrderNo = 2,
                EnteredOn = Moment
            });

            await context.SaveChangesAsync();
        }
        public async Task AddRooms(string roomModelName, List<string> lstRoomNos, List<RoomPriceSeedData> roomPrices, int orderStartFrom = 0)
        {
            int count = await context.RoomModels.CountAsync();

            count++;

            await context.RoomModels.AddAsync(new RoomModel
            {
                Code = count.ToString(),
                Description = roomModelName
            });

            foreach(var roomNo in lstRoomNos)
            {
                await context.Rooms.AddAsync(new Room
                {
                    RoomNo = roomNo.Trim(),
                    Title = roomNo,
                    RoomModel = count.ToString(),
                    OrderNo = orderStartFrom++,
                    IsActive = true,
                    IsDeleted = false,
                    EnteredBy = UserId,
                    EnteredOn = Moment
                });
            }

            foreach (var item in roomPrices)
            {
                await context.RoomPrices.AddAsync(new RoomPrice
                {
                    RoomModel = count.ToString(),
                    RoomType = item.Type,
                    Price = item.Price,
                    EnteredBy = UserId,
                    EnteredOn = Moment
                });
            }

            await context.SaveChangesAsync();
        }

        public class RoomPriceSeedData
        {
            public string Type { get; set; }
            public decimal Price { get; set; }
        }

    }
}
