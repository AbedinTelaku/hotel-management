using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace VillaApi.Models
{
    [Table("RoomMovement", Schema = "dbo")]
    public class RoomMovement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string RoomNo { get; set; }

        [ForeignKey(nameof(RoomNo))]
        public Room Room { get; set; }

        public DateTime EntryOn { get; set; } = DateTime.Now;

        public DateTime? ClosedOn { get; set; }

        public bool IsClosed { get; set; } = false;

        public bool IsMistake { get; set; } = false;

        [StringLength(50)]
        public string? ClientPlateNo { get; set; }

        [StringLength(50)]
        public string? ClientDocument { get; set; }

        [StringLength(50)]
        public string? ClientCarName { get; set; }

        public int EnteredBy { get; set; }

        [ForeignKey(nameof(EnteredBy))]
        public Users Users { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;
    }
}
