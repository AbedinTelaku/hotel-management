using VillaApi.Dtos;

namespace VillaApi.IRepository
{
    public interface IPrivilegeRepository
    {
        Task<string?> GetParameter(string name);

        Task<IEnumerable<PrivilegeDTO>?> GetByForm(string formName);

        Task<bool> HasPrivielege(string formName, string privilegeCode);

        Task<IEnumerable<string>?> GetAllPrivilege();

        Task<IEnumerable<PrivilegeTreeListDTO>?> GetAll(int userId = 0);

        Task<bool> Update(int userId, IEnumerable<PrivilegeTreeListDTO> privileges);

    }
}
