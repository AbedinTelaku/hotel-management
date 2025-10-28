using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VillaApi.Models
{
    [Table("ProductCategory", Schema = "dbo")]
    public class ProductCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        [Required]
        [StringLength(255)]
        public string Description { get; set; }

        public bool IsDeleted { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public int EnteredBy { get; set; }

        [ForeignKey(nameof(EnteredBy))]
        public Users Users { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;
    }
}
