using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.DtosParameters
{
    public class AddExtraInRoomParameters
    {
        [Required]
        public int RoomMovementId { get; set; }

        [Required]
        [StringLength(5, ErrorMessage = "Lloji i dhomës nuk mund të jetë më i gjatë se 5 karaktere")]
        public string RoomType { get; set; }

        public bool IsDebt { get; set; }

        public int Hours { get; set; }

        [Precision(18, 2)]
        public decimal Price { get; set; }
    }
}
