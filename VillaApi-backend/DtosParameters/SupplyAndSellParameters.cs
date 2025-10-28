using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.DtosParameters
{
    public class SupplyAndSellParameters
    {
        public DateTime DateAndTime { get; set; } = DateTime.Now;
        public bool IsSupply { get; set; } = false;
        public bool IsFree { get; set; } = false;
        public string? RoomNo { get; set; }
        public bool IsDebt { get; set; } = false;
        public bool IsMistake { get; set; } = false;
        public bool IsForStaff { get; set; } = false;

        [Precision(18, 2)]
        public decimal Discount { get; set; } = 0;

        public IEnumerable<SupplyAndSellItemsParameters> Items { get; set; }
    }
}
