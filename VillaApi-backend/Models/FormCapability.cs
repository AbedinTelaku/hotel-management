using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VillaApi.Models
{
    [Table("FormCapability", Schema = "dbo")]
    public class FormCapability
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string FormName { get; set; }

        [Required]
        [StringLength(50)]
        public string CapabilityCode { get; set; }

        [ForeignKey(nameof(CapabilityCode))]
        public Capability Capability { get; set; }


        [StringLength(255)]
        public string? ControlName { get; set; }
    }
}
