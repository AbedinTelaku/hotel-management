using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VillaApi.Dtos;
using VillaApi.IRepository;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class RoomModelController : ControllerBase
    {
        IRoomModelRepository _repo;
        public RoomModelController(IRoomModelRepository repo)
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

        [HttpPost]
        public async Task<ResponseDTO?> Add(string title)
        {
            var response = await _repo.Add(title);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> Update(RoomModelDTO parameters)
        {
            var response = await _repo.Update(parameters);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> Remove(string code)
        {
            var response = await _repo.Remove(code);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }
    }
}
