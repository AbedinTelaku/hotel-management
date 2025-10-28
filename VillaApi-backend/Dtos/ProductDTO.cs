using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;

namespace VillaApi.Dtos
{
    public class ProductDTO
    {
        public string Code { get; set; }

        public string Title { get; set; }

        public string Category { get; set; }

        public string CategoryTitle { get; set; }
        public decimal Price { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public byte[]? Image { get; set; }
        public string? ImageFormat { get; set; }

        public int OrderNo { get; set; } = 1;

        public string EnteredBy { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;

        public int Stock { get; set; } // Sasia ne stok
    }
}
