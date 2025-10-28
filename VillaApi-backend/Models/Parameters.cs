using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.Models
{
    [Table("Parameters", Schema = "dbo")]
    public class Parameters
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(255)]
        public string ParameterName { get; set; }

        [Required]
        public string ParameterValue { get; set; }

        
    }
}
