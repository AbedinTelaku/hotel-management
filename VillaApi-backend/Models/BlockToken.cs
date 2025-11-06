using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VillaApi.Models
{
    [Table("BlockToken", Schema = "dbo")]
    public class BlockToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UserId { get; set; }

        public DateTime MomentOfBlock { get; set; } = DateTime.Now;

        public DateTime ToDeleteRecordAt { get; set; }  

        public string Token { get; set; }
    }
}
