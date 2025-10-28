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
    public class RoomTypeController : ControllerBase
    {
        IRoomTypeRepository _repo;
        public RoomTypeController(IRoomTypeRepository repo)
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
        public async Task<ResponseDTO?> GetBasic(string roomModel)
        {
            var response = await _repo.GetBasic(roomModel);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetExtras(string roomModel)
        {
            var response = await _repo.GetExtras(roomModel);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> Add(RoomTypeDTO parameters)
        {
            var response = await _repo.Add(parameters);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> Update(RoomTypeDTO parameters)
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
