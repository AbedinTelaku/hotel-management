using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.Models;

namespace VillaApi.IRepository
{
    public interface IProductCategoryRepository
    {
        string GenereateCode();
        Task<IEnumerable<ProductCategoryDTO>?> GetAll();

        Task<IEnumerable<ProductCategoryDTO>?> GetActiveItems();

        Task<bool> Add(ProductCategoryParameters categoryParameters);

        Task<bool> Update(ProductCategoryParameters categoryParameters);

        Task<bool> Remove(string code);

        Task<bool> HasItemWithSameTitle(string title, string? code = null);

    }
}
