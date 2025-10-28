using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VillaApi.Models
{
    [Table("Payment", Schema = "dbo")]
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string DisplayText { get; set; }

        [Precision(18,2)]
        public decimal Amount { get; set; } = 0;

        public bool IsMistake { get; set; } = false;

        public bool IsForStaff { get; set; } = false;

        [Required]
        [StringLength(50)]
        public int EmployeeId { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Users Users { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;

        public int? RoomDetailsId { get; set; }

        public int? SupplyAndSellItemsId { get; set; }

    }
}
