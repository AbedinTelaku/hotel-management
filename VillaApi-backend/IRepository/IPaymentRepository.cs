using VillaApi.Dtos;

namespace VillaApi.IRepository
{
    public interface IPaymentRepository
    {
        Task<IEnumerable<PaymentDTO>?> GetAll();

        Task<IEnumerable<PaymentDTO>?> GetByEmployee(int employeeId);

        Task<bool> ConfirmAll();

        Task<bool> ConfirmByEmployee(int employeeId);

    }
}
