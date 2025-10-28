using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class PrivilegeController : ControllerBase
    {
        IPrivilegeRepository _repo;
        public PrivilegeController(IPrivilegeRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetParameter(string name)
        {
            var items = await _repo.GetParameter(name);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetByForm(string formName)
        {
            var items = await _repo.GetByForm(formName);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> HasPrivielege(string formName, string privilegeCode)
        {
            var items = await _repo.HasPrivielege(formName, privilegeCode);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetAll(int userId = 0)
        {
            var items = await _repo.GetAll(userId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetAllPrivilege()
        {
            var items = await _repo.GetAllPrivilege();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> Update(int userId, IEnumerable<PrivilegeTreeListDTO> privileges)
        {
            var items = await _repo.Update(userId, privileges);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }


    }
}
