using System.ComponentModel.DataAnnotations;

namespace VillaApi.Dtos
{
    public class RoomTypeWithPriceDTO
    {
        [StringLength(5)]
        public string? Code { get; set; }

        [Required]
        [StringLength(50)]
        public string Description { get; set; }

        public int Hours { get; set; } = 0;

        public decimal Price { get; set; } = 0;

        public bool IsCustom { get; set; } = false;

        public int OrderNo { get; set; }
    }
}
