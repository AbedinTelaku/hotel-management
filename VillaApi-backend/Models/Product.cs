using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.Models
{

    [Table("Product", Schema = "dbo")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [Required]
        [StringLength(50)]
        public string Category { get; set; }

        [Precision(18, 2)]
        public decimal Price { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public byte[]? Image { get; set; }
        public string? ImageFormat { get; set; }

        public int OrderNo { get; set; } = 1;

        public int Stock { get; set; } // Sasia ne stok

        public int EnteredBy { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;

    }
}
