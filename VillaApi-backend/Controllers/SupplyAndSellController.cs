using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VillaApi.DtosParameters;
using VillaApi.IRepository;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class SupplyAndSellController : ControllerBase
    {
        ISupplyAndSellRepository _repo;

        public SupplyAndSellController(ISupplyAndSellRepository repo)
        {
            _repo = repo;
        }


        [HttpPost]
        public async Task<ResponseDTO?> Add(SupplyAndSellParameters supplyAndSell)
        {
            var items = await _repo.Add(supplyAndSell);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        /// <summary>
        /// This function Add new items in existing bill
        /// </summary>
        /// <param name="supplyAndSellId">Id of bill</param>
        /// <param name="isDebt">False if the bill has been paid othervise true</param>
        /// <param name="supplyAndSellItems">Items that are going to be added to bill</param>
        /// <returns>True if the items has been saved in the bill, othervise false</returns>
        [HttpPost]
        public async Task<ResponseDTO?> Update(int supplyAndSellId, bool isDebt, IEnumerable<SupplyAndSellItemsParameters> supplyAndSellItems)
        {
            var items = await _repo.Update(supplyAndSellId, isDebt, supplyAndSellItems);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> ConfirmPaid(int supplyAndSellId)
        {
            var items = await _repo.ConfirmPaid(supplyAndSellId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpPut]
        public async Task<ResponseDTO?> UpdateQuantityOfItems(int suppyAndSellItemId, int quantity)
        {
            var items = await _repo.UpdateQuantityOfItems(suppyAndSellItemId, quantity);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> DeleteBill(int supplyAndSellId)
        {
            var items = await _repo.DeleteBill(supplyAndSellId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpDelete]
        public async Task<ResponseDTO?> DeleteItemInBill(int supplyAndSellItemsId)
        {
            var items = await _repo.DeleteItemInBill(supplyAndSellItemsId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetBillWithItems(string roomNo)
        {
            var items = await _repo.GetBillWithItems(roomNo);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetBills(DateTime fromDate, DateTime toDate)
        {
            var items = await _repo.GetBills(fromDate, toDate);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetItemsInBill(int billId)
        {
            var items = await _repo.GetItemsInBill(billId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetStock()
        {
            var items = await _repo.GetStock();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpGet]
        public async Task<ResponseDTO?> GetBillForRoom(int roomMovementId)
        {
            var items = await _repo.GetBillForRoom(roomMovementId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }


    }
}
