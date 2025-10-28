using Microsoft.EntityFrameworkCore;
using VillaApi.Models;

namespace VillaApi.Utils
{
    public static class SeedExtraRoomType
    {
        public static async Task SeedExtraRoomTypeAsync(MyDbContext context, int adminUserId = 1)
        {
            try
            {
                // Kontrollo nëse EXT1 ekziston tashmë
                var existingRoomType = await context.RoomTypes.FirstOrDefaultAsync(rt => rt.Code == "EXT1");
                if (existingRoomType != null)
                {
                    Console.WriteLine("✅ EXT1 room type already exists in database");
                    return;
                }

                // Kontrollo nëse përdoruesi admin ekziston, nëse jo, gjej një përdorues ekzistues
                var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Id == adminUserId);
                if (adminUser == null)
                {
                    // Gjej përdoruesin e parë ekzistues
                    adminUser = await context.Users.FirstOrDefaultAsync();
                    if (adminUser == null)
                    {
                        Console.WriteLine("❌ No users found in database. Cannot create EXT1 room type without a valid user.");
                        return;
                    }
                    adminUserId = adminUser.Id;
                    Console.WriteLine($"⚠️ Admin user ID 1 not found, using existing user ID {adminUserId}");
                }

                // Shto llojin e ri EXT1
                var extraRoomType = new RoomType
                {
                    Code = "EXT1",
                    Description = "Extra 1 Orë",
                    Hours = 1,
                    IsCustom = false,
                    IsExtra = true,
                    EnteredBy = adminUserId,
                    OrderNo = 1,
                    EnteredOn = DateTime.Now
                };

                await context.RoomTypes.AddAsync(extraRoomType);
                await context.SaveChangesAsync();

                Console.WriteLine($"✅ EXT1 room type added to database with EnteredBy: {adminUserId}");

                // Merr të gjitha modelet e dhomave
                var roomModels = await context.RoomModels.Select(rm => rm.Code).ToListAsync();

                // Shto çmimet për çdo model dhome
                foreach (var roomModel in roomModels)
                {
                    // Kontrollo nëse çmimi ekziston tashmë
                    var existingPrice = await context.RoomPrices
                        .FirstOrDefaultAsync(rp => rp.RoomModel == roomModel && rp.RoomType == "EXT1");
                    
                    if (existingPrice == null)
                    {
                        var roomPrice = new RoomPrice
                        {
                            RoomModel = roomModel,
                            RoomType = "EXT1",
                            Price = 5.00m,
                            EnteredBy = adminUserId,
                            EnteredOn = DateTime.Now
                        };

                        await context.RoomPrices.AddAsync(roomPrice);
                    }
                }

                await context.SaveChangesAsync();
                Console.WriteLine($"✅ Room prices added for {roomModels.Count} room models");

            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error seeding EXT1 room type: {ex.Message}");
                throw;
            }
        }
    }
}
