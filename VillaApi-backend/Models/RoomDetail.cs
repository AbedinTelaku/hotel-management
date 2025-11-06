using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.Models
{

    [Table("RoomDetails", Schema = "dbo")]
    public class RoomDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int RoomMovementId { get; set; }


        [Required]
        [StringLength(50)]
        public string RoomTypeCode { get; set; }


        public int Hours { get; set; } = 0;

        [Precision(18, 2)]
        public decimal Price { get; set; } = 0;

        public bool IsDebt { get; set; } = false;

        public int CreatedBy { get; set; }


        public int? CashierId { get; set; }


        public int EnteredBy { get; set; }


        public DateTime EnteredOn { get; set; } = DateTime.Now;
    }
}
