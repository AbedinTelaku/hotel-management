using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.Models
{
    [Table("SupplyAndSell", Schema = "dbo")]
    public class SupplyAndSell
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public DateTime DateAndTime { get; set; }

        [Precision(18, 2)]
        public decimal Total { get; set; } = 0;
        public bool IsSupply { get; set; } = false;
        public bool IsFree { get; set; } = false;

        public int? RoomMovementId { get; set; }

        [ForeignKey(nameof(RoomMovementId))]
        public RoomMovement? RoomMovement { get; set; }

        public bool IsDebt { get; set; } = false;
        public bool IsMistake { get; set; } = false;
        public bool IsForStaff { get; set; } = false;

        [Precision(18, 2)]
        public decimal Discount { get; set; } = 0;
        public int EnteredBy { get; set; }

        [ForeignKey(nameof(EnteredBy))]
        public Users Users { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;
    }
}
