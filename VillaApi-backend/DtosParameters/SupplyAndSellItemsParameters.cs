using System.ComponentModel.DataAnnotations;

namespace VillaApi.DtosParameters
{
    public class SupplyAndSellItemsParameters
    {
        [Required]
        [StringLength(50, ErrorMessage = "Kodi i produktit nuk mund të jetë me i gjatë se 50 karaktere")]
        public string ProductCode { get; set; }

        [Required]
        public int Quantity { get; set; } = 0;

    }
}
