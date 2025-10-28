using Microsoft.EntityFrameworkCore;
using VillaApi.Dtos;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class PrivilegeRepository : BaseRepository, IPrivilegeRepository
    {
        public PrivilegeRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<string?> GetParameter(string name)
        {
            var item = await _context.Parameters.FirstOrDefaultAsync(s => s.ParameterName == name);

            return item?.ParameterValue;
        }
        public async Task<IEnumerable<PrivilegeDTO>?> GetByForm(string formName)
        {
            var userId = GetUserIdFromToken();

            var items = from af in _context.FormAuthorizations
                        join fc in _context.FormCapabilities on af.FormCapabilityId equals fc.Id
                        join c in _context.Capabilities on fc.CapabilityCode equals c.Code
                        where af.UserId == userId && fc.FormName == formName
                        select new PrivilegeDTO
                        {
                           FormName = fc.FormName,
                           ControllName = fc.ControlName,
                           PrivilegeCode = c.Code,
                           PrivilegeDescription = c.Description
                        };

            return await items.ToListAsync();
        }

        public async Task<bool> HasPrivielege(string formName, string privilegeCode)
        {
            var userId = GetUserIdFromToken();

            var items = from af in _context.FormAuthorizations
                        join fc in _context.FormCapabilities on af.FormCapabilityId equals fc.Id
                        join c in _context.Capabilities on fc.CapabilityCode equals c.Code
                        where af.UserId == userId && fc.FormName == formName && c.Code == privilegeCode
                        select c.Code;

            return await items.AnyAsync();
        }

        public async Task<IEnumerable<string>?> GetAllPrivilege()
        {
            var userId = GetUserIdFromToken();

            var items = from af in _context.FormAuthorizations
                        join fc in _context.FormCapabilities on af.FormCapabilityId equals fc.Id
                        join c in _context.Capabilities on fc.CapabilityCode equals c.Code
                        where af.UserId == userId && c.Code == "OpenForm"
                        select fc.ControlName;

            return await items.ToListAsync();
        }


        public async Task<IEnumerable<PrivilegeTreeListDTO>?> GetAll(int userId = 0)
        {
            var items = from fc in _context.FormCapabilities
                        join c in _context.Capabilities on fc.CapabilityCode equals c.Code
                        from af in _context.FormAuthorizations.Where(x => x.FormCapabilityId == fc.Id && x.UserId == userId).DefaultIfEmpty()
                        select new PrivilegeTreeListDTO
                        {
                            Checked = af != null,
                            Id = fc.Id.ToString(),
                            ParentId = fc.FormName,
                            FormName = fc.FormName,
                            CapabilityCode = c.Code,
                            CapabilityDescription = c.Description
                        };

            return await items.ToListAsync();
        }

        
        public async Task<bool> Update(int userId, IEnumerable<PrivilegeTreeListDTO> privileges)
        {
            var itemsToRemove = await _context.FormAuthorizations.Where(s => s.UserId == userId).ToListAsync();

            if (itemsToRemove.Any())
                _context.FormAuthorizations.RemoveRange(itemsToRemove);

            await _context.SaveChangesAsync();

            if (privileges.Any())
            {
                foreach (var item in privileges)
                {
                    var _idItem = int.TryParse(item.Id, out int _idVal) ? _idVal : 0;

                    await _context.FormAuthorizations.AddAsync(new FormAuthorization
                    {
                        FormCapabilityId = _idItem,
                        UserId = userId
                    });
                }

               await _context.SaveChangesAsync();
            }

            return true;
        }

    }
}
