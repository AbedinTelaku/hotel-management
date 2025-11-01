using Microsoft.AspNetCore.SignalR;

namespace VillaApi.Hubs
{
    public class RoomsHub : Hub
    {
        public async Task RoomChanged(string? roomNo)
        {
            await Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
        }

        public async Task ForceLogout()
        {
            await Clients.All.SendCoreAsync("ForceLogout", Array.Empty<object?>());
        }

        // Group management: clients will call these to join proper group
        public Task JoinWorkers()
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, "workers");
        }

        public Task JoinAdmins()
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, "admins");
        }
       

    }
}
