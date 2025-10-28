using Microsoft.AspNetCore.SignalR;

namespace VillaApi.Hubs
{
    public class RoomsHub : Hub
    {
        public async Task RoomChanged(string? roomNo)
        {
            await Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
        }
    }
}
