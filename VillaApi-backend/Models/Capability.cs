using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VillaApi.Models
{
    [Table("Capability", Schema = "dbo")]
    public class Capability
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(50)]      
        public string Code { get; set; }

        public string? Description { get; set; }
    }
}
