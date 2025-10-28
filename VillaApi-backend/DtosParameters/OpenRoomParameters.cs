using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace VillaApi.DtosParameters
{
    public class OpenRoomParameters
    {
        [StringLength(20, ErrorMessage = "Nr. i dhomës nuk mund të jetë më i gjatë se 20 karaktere")]
        public string RoomNo { get; set; }


        [StringLength(50, ErrorMessage = "Nr. i tabelave të veturës nuk mund të jetë më i gjatë se 50 karaktere")]
        public string? ClientPlateNo { get; set; }

        [StringLength(50, ErrorMessage = "Id e dokumentit të klientit nuk mund të jetë më i gjatë se 50 karaktere")]

        public string? ClientDocument { get; set; }

        [StringLength(50, ErrorMessage = "Emri i veturës nuk mund të jetë më i gjatë se 50 karaktere")]

        public string? ClientCarName { get; set; }

        [Required]
        [StringLength(5, ErrorMessage = "Lloji i dhomës nuk mund të jetë më i gjatë se 5 karaktere")]
        public string RoomType { get; set; }

        public bool IsDebt { get; set; }

        public int Hours { get; set; }

        [Precision(18, 2)]
        public decimal Price { get; set; }
    }
}
