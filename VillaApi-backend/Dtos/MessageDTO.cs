using System.ComponentModel.DataAnnotations;

namespace VillaApi.Dtos
{
    public class MessageDTO
    {
        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        [Required]
        public string Message { get; set; }
    }

    public class MessageParameters
    {
        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        [Required]
        public string Message { get; set; }
    }
}
