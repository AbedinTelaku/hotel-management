using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Models;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]

    public class ProductCategoryController : ControllerBase
    {
        IProductCategoryRepository _repo;
        public ProductCategoryController(IProductCategoryRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetAll()
        {
            var items = await _repo.GetAll();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetActiveItems()
        {
            var items = await _repo.GetActiveItems();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }


        [HttpPost]
        public async Task<ResponseDTO?> Add(ProductCategoryParameters categoryParameters)
        {
            var response = await _repo.Add(categoryParameters);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> Update(ProductCategoryParameters categoryParameters)
        {
            var response = await _repo.Update(categoryParameters);

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

        [HttpGet]
        public async Task<ResponseDTO?> HasItemWithSameTitle(string title, string? code = null)
        {
            var response = await _repo.HasItemWithSameTitle(title, code);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }


    }
}
