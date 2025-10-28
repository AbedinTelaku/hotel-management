using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;

namespace VillaApi.Dtos
{
    public class PaymentDTO
    {
        public string DisplayText { get; set; }

        public decimal Amount { get; set; } = 0;

        public bool IsMistake { get; set; } = false;

        public string Employee { get; set; }

        public DateTime EnteredOn { get; set; }

        public bool IsForStaff { get; set; } = false;

        public bool IsMarket { get; set;  }
       
        public string Koha { get { return EnteredOn.ToString("dd.MM.yyyy HH:mm"); } set { } }
    }
}
