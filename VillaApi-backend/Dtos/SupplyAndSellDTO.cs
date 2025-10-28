using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;

namespace VillaApi.Dtos
{
    public class SupplyAndSellDTO
    {
        public int Id { get; set; }
        public DateTime DateAndTime { get; set; }
        public decimal Total { get; set; } = 0;
        public bool IsSupply { get; set; } = false;
        public bool IsFree { get; set; } = false;
        public string? RoomNo { get; set; }
        public string? RoomTitle { get; set; }
        public bool IsDebt { get; set; } = false;
        public bool IsMistake { get; set; } = false;
        public bool IsForStaff { get; set; } = false;
        public decimal Discount { get; set; } = 0;
        public string EnteredBy { get; set; }
        public DateTime EnteredOn { get; set; } = DateTime.Now;

        public IEnumerable<SupplyAndSellItemDTO> Items { get; set; }
    }
}
