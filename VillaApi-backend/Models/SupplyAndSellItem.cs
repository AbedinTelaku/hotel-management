using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.Models
{
    [Table("SupplyAndSellItems", Schema = "dbo")]
    public class SupplyAndSellItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int SupplyAndSellId { get; set; }

        [ForeignKey(nameof(SupplyAndSellId))]
        public SupplyAndSell SupplyAndSell { get; set; }

        [Required]
        [StringLength(50)]
        public string ProductCode { get; set; }

        [ForeignKey(nameof(ProductCode))]
        public Product Product { get; set; }

        public int Quantity { get; set; } = 0;

        [Precision(18, 2)]
        public decimal Price { get; set; } = 0;

        public int CreatedBy { get; set; }


        public int? CashierId { get; set; }

    }
}
