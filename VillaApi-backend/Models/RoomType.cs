using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.Models
{
    [Table("RoomType", Schema = "dbo")]
    public class RoomType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Required]
        [StringLength(5)]
        public string Code { get; set; }

        [Required]
        [StringLength(50)]
        public string Description { get; set; }

        public int Hours { get; set; } = 0;

        public bool IsCustom { get; set; } = false;

        public bool IsExtra { get; set; } = false;

        public int EnteredBy { get; set; }

        public int OrderNo { get; set; } = 1;

        [ForeignKey(nameof(EnteredBy))]
        public Users Users { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;
    }
}
