using VillaApi.Dtos;
using VillaApi.DtosParameters;

namespace VillaApi.IRepository
{
    public interface IProductRepository
    {
        string GenereateCode();

        Task<IEnumerable<ProductDTO>?> GetAll();

        Task<IEnumerable<ProductDTO>?> GetByCategory(string category);

        Task<ProductDTO?> GetByCode(string code);

        Task<bool> Add(ProductParameters parameters);

        Task<bool> Update(ProductParameters parameters);

        Task<bool> Remove(string code);
        Task<bool> HasItemWithSameTitle(string title, string? code = null);

    }
}
