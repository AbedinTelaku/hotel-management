using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VillaApi.IRepository;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        IPaymentRepository _repo;
        public PaymentController(IPaymentRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetAll()
        {
            var response = await _repo.GetAll();
            
            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetByEmployee(int employeeId)
        {
            var response = await _repo.GetByEmployee(employeeId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> ConfirmAll()
        {
            var response = await _repo.ConfirmAll();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

       

        [HttpDelete]
        public async Task<ResponseDTO?> ConfirmByEmployee(int employeeId)
        {
            var response = await _repo.ConfirmByEmployee(employeeId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }
    }
}
