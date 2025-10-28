using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.Models
{
    [Table("SuggestionCarName", Schema = "dbo")]
    public class SuggestionCarName
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(50, ErrorMessage = "Emri i veturës nuk mund të jetë me i gjatë se 50 karaktere")]
        [Display(Name = "Emri i veturës")]
        public string CarName { get; set; }

        
    }
}
