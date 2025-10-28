using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.Models
{
    [Table("RoomPrice", Schema = "dbo")]
    public class RoomPrice
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }


        [Required]
        [StringLength(50)]
        public string RoomModel { get; set; }

        [Required]
        [StringLength(5)]
        public string RoomType { get; set; }

        [Precision(18, 2)]
        public decimal Price { get; set; } = 0;

        public int EnteredBy { get; set; }

        [ForeignKey(nameof(EnteredBy))]
        public Users Users { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;
    }
}
