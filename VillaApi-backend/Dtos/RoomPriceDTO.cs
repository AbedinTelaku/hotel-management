using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;

namespace VillaApi.Dtos
{
    public class RoomPriceDTO
    {
        public int Id { get; set; }

        public string RoomModel { get; set; }
        public string RoomModelTitle { get; set; }

        public string RoomType { get; set; }
        public string RoomTypeTitle { get; set; }

        public decimal Price { get; set; } = 0;

        public string EnteredBy { get; set; }

        public DateTime EnteredOn { get; set; }
    }
}
