using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using VillaApi.Models;

namespace VillaApi.Dtos
{
    public class RoomTypeDTO
    {
        [StringLength(5)]
        public string? Code { get; set; }

        [Required]
        [StringLength(50)]
        public string Description { get; set; }

        public int Hours { get; set; } = 0;

        public bool IsCustom { get; set; } = false;

        public bool IsExtra { get; set; } = false;

        public int OrderNo { get; set; } = 1;

        public string EnteredBy { get; set; }

        public DateTime EnteredOn { get; set; }
    }
}
