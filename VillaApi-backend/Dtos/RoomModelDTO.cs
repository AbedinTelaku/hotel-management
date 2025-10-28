using System.ComponentModel.DataAnnotations;

namespace VillaApi.Dtos
{
    public class RoomModelDTO
    {
        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        [Required]
        [StringLength(255)]
        public string Description { get; set; }

    }
}
