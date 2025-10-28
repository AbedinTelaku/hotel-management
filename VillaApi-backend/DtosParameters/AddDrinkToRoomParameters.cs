using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.DtosParameters
{
    public class AddDrinkToRoomParameters
    {
        [Required]
        public int RoomMovementId { get; set; }

        [Required]
        [StringLength(50)]
        public string ProductCode { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Precision(18, 2)]
        public decimal Price { get; set; }

        public bool IsDebt { get; set; }
    }
}
