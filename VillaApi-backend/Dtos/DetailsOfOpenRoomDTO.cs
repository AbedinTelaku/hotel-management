using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace VillaApi.Dtos
{
    public class DetailsOfOpenRoomDTO
    {
        public int RoomMovementId { get; set; }
        public string RoomNo { get; set; }

        public string RoomTitle { get; set; }

        public string? ClientPlateNo { get; set; }

        public string? ClientDocument { get; set; }

        public string? ClientCarName { get; set; }

        public string RoomTypeDescription { get; set; }

        public string StartTime { get; set; }

        public string SpendTime { get; set; }

        public string Extras { get; set; }

        [Precision(18,2)]
        public decimal RoomDebt { get; set; }

        [Precision(18, 2)]
        public decimal MarketDebt { get; set; }

        [Precision(18, 2)]
        public decimal GratisAmount { get; set; }

        [Precision(18, 2)]
        public decimal RoomAmount { get; set; }
        [Precision(18, 2)]
        public decimal MarketAmount { get; set; }
        [Precision(18, 2)]
        public decimal Total { get; set; }
    }
}
