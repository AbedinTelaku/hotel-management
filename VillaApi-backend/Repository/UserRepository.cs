using Microsoft.EntityFrameworkCore;
using VillaApi.Dtos;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class UserRepository : IUserRepository
    {
        MyDbContext _context;
        private readonly MyMessages _myMessages;
        
        public UserRepository(MyDbContext context, MyMessages myMessages)
        {
            _context = context;
            _myMessages = myMessages;
        }

        public async Task<bool> Register(string username, string password, bool isAdmin = false)
        {
            if (username.Length > 50)
                throw new MyExceptionMessage(_myMessages.GetMessage(6)
                                        .Replace("{0}", "Emri i përdoruesit")
                                        .Replace("{1}", "50"));

            if (await _context.Users.AnyAsync(s => s.Username == username && !s.IsDeleted))
                throw new MyException(7);

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            await _context.Users.AddAsync(new Users 
            { 
                Username = username, 
                Password = passwordHash,
                IsAdmin = isAdmin
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<UserDTO?> Login(LoginRequestDTO request)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Username == request.Username && !s.IsDeleted);

            if (item is null)
                throw new MyException(8);

            if (!BCrypt.Net.BCrypt.Verify(request.Password, item.Password))
                throw new MyException(9);

            if (!item.IsActive)
                throw new MyException(10);

            if (item.IsAdmin == false && await _context.Users.AnyAsync(x => x.IsAdmin == false && x.IsLoggedIn && x.Id != item.Id))
                return null;

            item.IsLoggedIn = true;
            await _context.SaveChangesAsync();

            return new UserDTO
            {
                Id = item.Id,
                Username = item.Username,
                IsActive = item.IsActive,
                IsAdmin = item.IsAdmin
            };
        }

        public async Task<IEnumerable<UserDTO>?> GetAll()
        {
            var items = await _context.Users.Where(s => !s.IsDeleted)
                                    .Select(s => new UserDTO 
                                    {
                                        Id = s.Id,
                                        Username = s.Username,
                                        IsActive = s.IsActive,
                                        IsAdmin = s.IsAdmin,
                                    }).ToListAsync();

            return items;
        }

        public async Task<UserDTO?> GetById(int id)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (item is null)
                throw new MyException(8);

            return new UserDTO
            {
                Id = item.Id,
                Username = item.Username,
                IsActive = item.IsActive,
                IsAdmin = item.IsAdmin
            };
        }

        public async Task<UserDTO?> GetByUsername(string username)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Username == username && !s.IsDeleted);

            if (item is null)
                throw new MyException(8);

            return new UserDTO
            {
                Id = item.Id,
                Username = item.Username,
                IsActive = item.IsActive,
                IsAdmin = item.IsAdmin
            };
        }

        public async Task<bool> Update(UserDTO item)
        {
            var existingItem = await _context.Users.FirstOrDefaultAsync(s => s.Id == item.Id && !s.IsDeleted);

            if (existingItem is null)
                throw new MyException(8);

            existingItem.Username = item.Username;
            existingItem.IsActive = item.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Logout(int id)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == id);

            if (item is null)
                throw new MyException(8);

            item.IsLoggedIn = false;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ResetLogout()
        {
            var items = await _context.Users.ToListAsync();

            foreach (var item in items)
            {
                item.IsLoggedIn = false;
            }

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Delete(int id)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == id);

            if (item is null)
                throw new MyException(8);

            item.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ChangePassword(int userId, string oldPassword, string password)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == userId);

            if (item is null)
                throw new MyException(8);

            if (!BCrypt.Net.BCrypt.Verify(oldPassword, item.Password))
                throw new MyException(9);

            item.Password = BCrypt.Net.BCrypt.HashPassword(password);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateStatus(int userId, bool isActive)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == userId);

            if (item is null)
                throw new MyException(8);

            item.IsActive = isActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(int userId)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == userId);

            if (item is null)
                throw new MyException(8);

            item.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> SetDefaultPassword(int userId)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == userId);

            if (item is null)
                throw new MyException(8);

            
            item.Password = BCrypt.Net.BCrypt.HashPassword("12345678");

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateAdminStatus(int userId, bool isAdmin)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == userId);

            if (item is null)
                throw new MyException(8);

            item.IsAdmin = isAdmin;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> GetIsLoggedIn(int userId)
        {
            var item = await _context.Users.FirstOrDefaultAsync(s => s.Id == userId);
            if (item is null)
                throw new MyException(8);
            return item.IsLoggedIn;
        }


    }
}
