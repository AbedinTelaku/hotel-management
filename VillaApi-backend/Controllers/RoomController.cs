using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Portable.Licensing;
using Portable.Licensing.Validation;
using System.Security.Cryptography.X509Certificates;
using System.Xml;
using VillaApi.Dtos;
using VillaApi.DtosParameters;
using VillaApi.Hubs;
using VillaApi.IRepository;
using VillaApi.Models;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class RoomController : ControllerBase
    {
        IRoomRepository _repo;
        IHubContext<RoomsHub> _hubContext;
        private readonly LicenseInformation _license;
        public RoomController(IRoomRepository repo, IHubContext<RoomsHub> hubContext, LicenseInformation license)
        {
            _repo = repo;
            _hubContext = hubContext;
            _license = license;
        }

       

        [HttpGet]
        public async Task<ResponseDTO?> GetAllRooms()
        {
            var response = await _repo.GetAllRooms();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetActiveRooms()
        {
            var response = await _repo.GetActiveRooms();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetItem(string roomNo)
        {
            var response = await _repo.GetItem(roomNo);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> Add(RoomParameters parameters)
        {
            var response = await _repo.Add(parameters);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> Update(RoomParameters parameters)
        {
            var response = await _repo.Update(parameters);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> Remove(string roomNo)
        {
            var response = await _repo.Remove(roomNo);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetAvailableRooms(string roomModel)
        {
            var response = await _repo.GetAvailableRooms(roomModel);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }


        [HttpGet]
        public async Task<ResponseDTO?> GetRooms()
        {
            var licenseValid = _license.IsValid;

            if (!licenseValid && _license.ShowMessageAlert && !_license.AlertOpen)
            {
                await _hubContext.Clients.All.SendCoreAsync("LicenseExpire", new object[] { _license.GetMessgeToDisplay() });
            }

            var response = await _repo.GetRooms();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                ErrorMessage = licenseValid ? null : _license.GetMessgeToDisplay(),
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetRoomByNo(string roomNo)
        {
            var response = await _repo.GetRoomByNo(roomNo);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> OpenRoom(OpenRoomParameters parameters)
        {
            var roomMovementId = await _repo.OpenRoom(parameters);

            if (roomMovementId > 0)
                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { parameters.RoomNo });

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = roomMovementId
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> AddExtraInRoom(AddExtraInRoomParameters parameters)
        {
            var response = await _repo.AddExtraInRoom(parameters);

            if (response)
            {
                var roomNo = await _repo.GetRoomNo(parameters.RoomMovementId);

                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
            }

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPost]
        public async Task<ResponseDTO?> AddDrinkToRoom(AddDrinkToRoomParameters parameters)
        {
            var response = await _repo.AddDrinkToRoom(parameters);

            if (response)
            {
                var roomNo = await _repo.GetRoomNo(parameters.RoomMovementId);

                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
            }

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }


        [HttpPut]
        public async Task<ResponseDTO?> Mistake(int roomMovementId)
        {
            var response = await _repo.Mistake(roomMovementId);

            if (response)
            {
                var roomNo = await _repo.GetRoomNo(roomMovementId);

                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
            }

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }


        [HttpPut]
        public async Task<ResponseDTO?> ChangeRoom(int roomMovementId, string roomNo)
        {
            var response = await _repo.ChangeRoom(roomMovementId, roomNo);

            if (response)
            {
                var oldRoomNo = await _repo.GetRoomNo(roomMovementId);

                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { oldRoomNo, roomNo });
            }

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> ConfirmPaidForRoom(int roomMovementId)
        {
            var response = await _repo.ConfirmPaidForRoom(roomMovementId);

            if (response)
            {
                var roomNo = await _repo.GetRoomNo(roomMovementId);

                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
            }

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }


        [HttpPut]
        public async Task<ResponseDTO?> ConfirmAllTheDebt(int roomMovementId)
        {
            var response = await _repo.ConfirmAllTheDebt(roomMovementId);

            if (response)
            {
                var roomNo = await _repo.GetRoomNo(roomMovementId);

                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
            }

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetConfirmMessage(int roomMovementId)
        {
            var response = await _repo.GetConfirmMessage(roomMovementId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> CloseRoom(int roomMovementId)
        {
            var response = await _repo.CloseRoom(roomMovementId);

            if (response)
            {
                var roomNo = await _repo.GetRoomNo(roomMovementId);

                await _hubContext.Clients.All.SendCoreAsync("RoomHasBeenUpdated", new object[] { roomNo });
            }

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetRoomDetails(int roomMovementId)
        {
            var response = await _repo.GetRoomDetails(roomMovementId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = response
            };
        }

    }
}
