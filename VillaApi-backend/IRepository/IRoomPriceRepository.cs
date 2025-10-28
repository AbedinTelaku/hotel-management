using VillaApi.Dtos;
using VillaApi.DtosParameters;

namespace VillaApi.IRepository
{
    public interface IRoomPriceRepository
    {
        Task<IEnumerable<RoomPriceDTO>?> GetAll();

        Task<RoomPriceDTO?> GetItem(int id);

        Task<RoomPriceDTO?> GetItemByTypeAndModel(string type, string model);

        Task<bool> Add(RoomPriceParameters parameters);

        Task<bool> Update(int id, decimal price);

        Task<bool> Remove(int id);
    }
}
