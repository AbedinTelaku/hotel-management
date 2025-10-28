using VillaApi.Dtos;

namespace VillaApi.IRepository
{
    public interface IRoomTypeRepository
    {
        string GenereateCode();

        Task<IEnumerable<RoomTypeDTO>?> GetAll();

        Task<bool> Add(RoomTypeDTO parameters);

        Task<bool> Update(RoomTypeDTO parameters);

        Task<bool> Remove(string code);

        Task<IEnumerable<RoomTypeWithPriceDTO>?> GetExtras(string roomModel);

        Task<IEnumerable<RoomTypeWithPriceDTO>?> GetBasic(string roomModel);
    }
}
