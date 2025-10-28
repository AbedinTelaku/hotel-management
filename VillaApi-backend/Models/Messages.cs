using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.Models
{
    [Table("Messages", Schema = "dbo")]
    public class Messages
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        public string Message { get; set; }
    }
}
