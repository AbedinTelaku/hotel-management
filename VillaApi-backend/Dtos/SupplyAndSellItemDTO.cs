using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;

namespace VillaApi.Dtos
{
    public class SupplyAndSellItemDTO
    {
        public int Id { get; set; }
        public string ProductCode { get; set; }

        public string ProductName { get; set; }

        public int Quantity { get; set; } = 0;

        public decimal Price { get; set; } = 0;

    }
}
