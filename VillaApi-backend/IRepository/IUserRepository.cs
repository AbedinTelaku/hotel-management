using VillaApi.Dtos;
using VillaApi.Models;

namespace VillaApi.IRepository
{
    public interface IUserRepository
    {
        Task<bool> Register(string username, string password, bool isAdmin = false);
        Task<UserDTO?> Login(LoginRequestDTO request);
        Task<IEnumerable<UserDTO>?> GetAll();
        Task<UserDTO?> GetById(int id);
        Task<UserDTO?> GetByUsername(string username);
        Task<bool> Update(UserDTO item);
        Task<bool> Logout(int id);
        Task<bool> ResetLogout();
        Task<bool> ChangePassword(int userId, string oldPassword, string password);
        Task<bool> UpdateStatus(int userId, bool isActive);
        Task<bool> Remove(int userId);
        Task<bool> SetDefaultPassword(int userId);
        Task<bool> UpdateAdminStatus(int userId, bool isAdmin);
        Task<bool> Delete(int id);
        Task<bool> GetIsLoggedIn(int userId);

        Task SaveTokenUser(int userId, string token, DateTime expire);
        Task BlockTokens();
        Task DeleteExpireTokens(CancellationToken cancellationToken);
        bool IsTokenBlocked(string token);

    }
}
