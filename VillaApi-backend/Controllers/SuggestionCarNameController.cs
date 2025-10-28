using Azure.Core;
using Microsoft.AspNetCore.Authentication.OAuth.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Security.Claims;
using VillaApi.IRepository;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SuggestionCarNameController : ControllerBase
    {
        ISuggestionCarNameRepository _suggestionCarNameRepository;
        public SuggestionCarNameController(ISuggestionCarNameRepository suggestionCarNameRepository)
        {
            _suggestionCarNameRepository = suggestionCarNameRepository;
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetAll()
        {
            var items = await _suggestionCarNameRepository.GetAll();        

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items,
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> Add(string carName)
        {
            var response = await _suggestionCarNameRepository.Add(carName);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> Remove(string carName)
        {
            var response = await _suggestionCarNameRepository.Remove(carName);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

    }
}
