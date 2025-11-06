using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VillaApi.Models
{
    [Table("LoginToken", Schema = "dbo")]

    public class LoginToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UserId { get; set; }
        public string Token { get; set; }   
        public DateTime MomentOfLogin { get; set; }
        public DateTime ExpireAt { get; set; }
    }
}
