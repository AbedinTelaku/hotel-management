using System.ComponentModel.DataAnnotations;

namespace VillaApi.DtosParameters
{
    public class RoomParameters
    {
        [StringLength(20, ErrorMessage = "Nr.i dhomës nuk mund të jetë më i gjatë se 20 karaktere")]
        public string RoomNo { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "Titulli nuk mund të jetë më i gjatë se 50 karaktere")]
        public string Title { get; set; }

        public int OrderNo { get; set; } = 0;

        [Required]
        [StringLength(50, ErrorMessage = "Modeli nuk mund të jetë më i gjatë se 50 karaktere")]
        public string RoomModel { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
