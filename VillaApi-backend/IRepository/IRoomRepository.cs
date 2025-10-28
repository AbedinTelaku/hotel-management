using VillaApi.Dtos;
using VillaApi.DtosParameters;

namespace VillaApi.IRepository
{
    public interface IRoomRepository
    {
        string GenereateRoomNo();
        Task<string?> GetRoomNo(int movementId);
        Task<bool> Add(RoomParameters parameters);
        Task<bool> Update(RoomParameters parameters);
        Task<bool> Remove(string roomNo);

        Task<IEnumerable<RoomDTO>?> GetAllRooms();
        Task<IEnumerable<RoomDTO>?> GetActiveRooms();
        Task<RoomDTO?> GetItem(string roomNo);

        Task<IEnumerable<RoomViewDTO>?> GetAvailableRooms(string roomModel);
        Task<IEnumerable<RoomViewDTO>?> GetRooms();

        Task<RoomViewDTO?> GetRoomByNo(string roomNo);
        Task<int> OpenRoom(OpenRoomParameters parameters);

        Task<bool> AddExtraInRoom(AddExtraInRoomParameters parameters);
        Task<bool> AddDrinkToRoom(AddDrinkToRoomParameters parameters);

        Task<bool> Mistake(int roomMovementId);
        Task<bool> ChangeRoom(int roomMovementId, string roomNo);
        Task<bool> ConfirmPaidForRoom(int roomMovementId);

        Task<bool> ConfirmAllTheDebt(int roomMovementId);

        Task<string> GetConfirmMessage(int roomMovementId);

        Task<bool> CloseRoom(int roomMovementId);

        Task<DetailsOfOpenRoomDTO> GetRoomDetails(int roomMovementId);
    }
}
