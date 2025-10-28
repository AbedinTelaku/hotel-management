using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.DtosParameters
{
    public class ProductParameters
    {
        [StringLength(50, ErrorMessage = "Kodi nuk mund të jetë me i gjatë se 50 karaktere")]
        public string? Code { get; set; }

        [Required(ErrorMessage = "Titulli duhet të plotësohet")]
        [StringLength(255, ErrorMessage = "Titulli nuk mund të jetë me i gjatë se 50 karaktere")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Kategoria duhet të plotësohet")]
        [StringLength(50, ErrorMessage = "Kodi i kategorisë nuk mund të jetë me i gjatë se 50 karaktere")]
        public string Category { get; set; }

        [Precision(18, 2)]
        public decimal Price { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public int OrderNo { get; set; } = 1;

        public byte[]? Image { get; set; }
        public string? ImageFormat { get; set; }

        public int Stock { get; set; } // Sasia ne stok
    }
}
