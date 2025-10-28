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
    public class RoomPriceController : ControllerBase
    {
        IRoomPriceRepository _repo;
        public RoomPriceController(IRoomPriceRepository repo)
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
        public async Task<ResponseDTO?> GetItem(int id)
        {
            var response = await _repo.GetItem(id);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetItemByTypeAndModel(string type, string model)
        {
            var response = await _repo.GetItemByTypeAndModel(type, model);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }


        [HttpPost]
        public async Task<ResponseDTO?> Add(RoomPriceParameters parameters)
        {
            var response = await _repo.Add(parameters);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> Update(int id, decimal price)
        {
            var response = await _repo.Update(id, price);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> Remove(int id)
        {
            var response = await _repo.Remove(id);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

    }
}
