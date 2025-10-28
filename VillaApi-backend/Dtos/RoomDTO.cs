using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VillaApi.Models;

namespace VillaApi.Dtos
{
    public class RoomDTO
    {
        public string RoomNo { get; set; }

        public string Title { get; set; }

        public int OrderNo { get; set; }

        public string RoomModel { get; set; }

        public string RoomModelDescription { get; set; }

        public bool IsActive { get; set; }

        public string EnteredBy { get; set; }

        public DateTime EnteredOn { get; set; }
    }
}
