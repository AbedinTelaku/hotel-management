using VillaApi.Dtos;

namespace VillaApi.IRepository
{
    public interface IRoomModelRepository
    {
        string GenereateCode();

        Task<IEnumerable<RoomModelDTO>?> GetAll();

        Task<bool> Add(string title);

        Task<bool> Update(RoomModelDTO parameters);

        Task<bool> Remove(string code);


    }
}
