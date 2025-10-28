using VillaApi.Dtos;
using VillaApi.DtosParameters;

namespace VillaApi.IRepository
{
    public interface ISupplyAndSellRepository
    {

        Task<bool> Add(SupplyAndSellParameters supplyAndSell);

        Task<bool> Update(int supplyAndSellId, bool isDebt, IEnumerable<SupplyAndSellItemsParameters> supplyAndSellItems);

        Task<bool> ConfirmPaid(int supplyAndSellId);

        Task<bool> UpdateQuantityOfItems(int suppyAndSellItemId, int quantity);

        Task<bool> DeleteBill(int supplyAndSellId);

        Task<bool> DeleteItemInBill(int supplyAndSellItemsId);

        Task<SupplyAndSellDTO?> GetBillWithItems(string roomNo);

        Task<IEnumerable<SupplyAndSellDTO>?> GetBills(DateTime fromDate, DateTime toDate);

        Task<IEnumerable<SupplyAndSellItemDTO>?> GetItemsInBill(int billId);

        Task<IEnumerable<StockDTO>?> GetStock();

        Task<IEnumerable<SupplyAndSellItemDTO>?> GetBillForRoom(int roomMovementId);

    }
}
