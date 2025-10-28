namespace VillaApi.Dtos
{
    public class RoomViewDTO
    {
        public int? RoomMovementId { get; set; }
        public string RoomNo { get; set; }

        public string Title { get; set; }

        public int OrderNo { get; set; }

        public string RoomModel { get; set; }

        public string RoomModelDescription { get; set; }

        public bool IsOpen { get; set; }

        public string? RoomType { get; set; }
        public string? RoomTypeDescription { get; set; }

        public bool IsExtraRoomType { get; set; } = false;

        public decimal AmountDebt { get; set; }

        public int Hours { get; set; } = 0;

        public decimal Price { get; set; } = 0;
        public int MinuteLeft { get; set; } = 0;

        public DateTime? EntryOn { get; set; } // Koha kur u hap dhoma

        public string? ClientPlateNo { get; set; } // Numri i tabelave të veturës
        public string? ClientCarName { get; set; } // Emri i veturës
        public string? ClientDocument { get; set; } // Dokumenti i klientit

    }
}
