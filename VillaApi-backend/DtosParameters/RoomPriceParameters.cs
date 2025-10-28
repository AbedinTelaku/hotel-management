using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.DtosParameters
{
    public class RoomPriceParameters
    {
        [Required]
        [StringLength(50, ErrorMessage = "Modeli nuk mund të jetë me i gjatë se 50 karaktere")]
        public string RoomModel { get; set; }

        [Required]
        [StringLength(5, ErrorMessage = "Lloji nuk mund të jetë me i gjatë se 5 karaktere")]
        public string RoomType { get; set; }

        [Precision(18, 2)]
        public decimal Price { get; set; } = 0;
    }
}
