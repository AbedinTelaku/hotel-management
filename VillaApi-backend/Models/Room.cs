using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.Models
{

    [Table("Room", Schema = "dbo")]
    public class Room
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(20)]
        public string RoomNo { get; set; }

        [Required]
        [StringLength(50)]
        public string Title { get; set; }

        public int OrderNo { get; set; } = 0;

        [Required]
        [StringLength(50)]
        public string RoomModel { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public int EnteredBy { get; set; }

        [ForeignKey(nameof(EnteredBy))]
        public Users Users { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;

    }
}
