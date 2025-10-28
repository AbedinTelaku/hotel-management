using System.ComponentModel.DataAnnotations;

namespace VillaApi.DtosParameters
{
    public class ProductCategoryParameters
    {
        [StringLength(50, ErrorMessage = "Kodi nuk mund të jetë me i gjatë se 50 karaktere")]
        public string? Code { get; set; }


        [Required(ErrorMessage = "Ju lutem plotësojeni titullin")]
        [StringLength(255, ErrorMessage = "Titulli nuk mund të jetë me i gjatë se 50 karaktere")]
        public string Description { get; set; }


        public bool IsActive { get; set; } = true;
    }
}
