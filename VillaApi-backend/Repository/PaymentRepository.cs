using Microsoft.EntityFrameworkCore;
using VillaApi.Dtos;
using VillaApi.IRepository;

namespace VillaApi.Repository
{
    public class PaymentRepository : BaseRepository, IPaymentRepository
    {
        public PaymentRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<PaymentDTO>?> GetAll()
        {
            var items = from s in _context.Payments
                        join p in _context.Users on s.EmployeeId equals p.Id
                        select new PaymentDTO
                        {
                            DisplayText = s.DisplayText,
                            Amount = s.Amount,
                            Employee = p.Username,
                            EnteredOn = s.EnteredOn,
                            IsMistake = s.IsMistake
                        };

            return await items.ToListAsync();
        }

        public async Task<IEnumerable<PaymentDTO>?> GetByEmployee(int employeeId)
        {
            var items = from s in _context.Payments
                        join p in _context.Users on s.EmployeeId equals p.Id
                        where s.EmployeeId == employeeId
                        select new PaymentDTO
                        {
                            DisplayText = s.DisplayText,
                            Amount = s.Amount,
                            Employee = p.Username,
                            EnteredOn = s.EnteredOn,
                            IsMistake = s.IsMistake,
                            IsForStaff = s.IsForStaff,
                            IsMarket = s.SupplyAndSellItemsId != null
                        };

            return await items.ToListAsync();
        }

        public async Task<bool> ConfirmAll()
        {
            var items = await _context.Payments.ToListAsync();

            // Throw only when there is nothing to confirm
            if (!(items?.Any() ?? false))
                throw new MyException(29);

            _context.Payments.RemoveRange(items);

            _context.SaveChanges();
            return true;
        }

        public async Task<bool> ConfirmByEmployee(int employeeId)
        {
            var items = await _context.Payments.Where(s => s.EmployeeId == employeeId).ToListAsync();

            // Throw only when this employee has nothing to confirm
            if (!(items?.Any() ?? false))
                throw new MyException(29);

            _context.Payments.RemoveRange(items);

            _context.SaveChanges();
            return true;
        }

    }
}
