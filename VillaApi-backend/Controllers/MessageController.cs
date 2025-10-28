using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VillaApi.Dtos;
using VillaApi.IRepository;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly IMessageRepository _repo;

        public MessageController(IMessageRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetAll()
        {
            var response = await _repo.GetAllMessages();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetByCode(string code)
        {
            var response = await _repo.GetMessage(code);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> Add(MessageParameters parameters)
        {
            var response = await _repo.AddMessage(parameters.Code, parameters.Message);

            return new ResponseDTO
            {
                IsSuccessfull = response,
                Data = response ? "Message added successfully" : "Failed to add message or message already exists"
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> Update(MessageParameters parameters)
        {
            var response = await _repo.UpdateMessage(parameters.Code, parameters.Message);

            return new ResponseDTO
            {
                IsSuccessfull = response,
                Data = response ? "Message updated successfully" : "Failed to update message or message not found"
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> Delete(string code)
        {
            var response = await _repo.DeleteMessage(code);

            return new ResponseDTO
            {
                IsSuccessfull = response,
                Data = response ? "Message deleted successfully" : "Failed to delete message or message not found"
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> DeleteAll()
        {
            var response = await _repo.DeleteAllMessages();

            return new ResponseDTO
            {
                IsSuccessfull = response,
                Data = response ? "All messages deleted successfully" : "No messages found to delete"
            };
        }
    }
}
