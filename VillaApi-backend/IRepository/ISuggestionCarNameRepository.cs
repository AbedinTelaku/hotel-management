using VillaApi.Dtos;
using VillaApi.Models;

namespace VillaApi.IRepository
{
    public interface ISuggestionCarNameRepository
    {
        Task<IEnumerable<string>> GetAll();

        Task<bool> Add(string carName);
        Task<bool> Remove(string carName);
    }
}
