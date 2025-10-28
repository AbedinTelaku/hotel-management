using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.Models
{
    [Table("FormAuthorization", Schema = "dbo")]
    public class FormAuthorization
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int FormCapabilityId { get; set; }

        [ForeignKey(nameof(FormCapabilityId))]
        public FormCapability FormCapability { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public Users Users { get; set; }
    }
}
