using System.ComponentModel.DataAnnotations;

namespace VillaApi.Dtos
{
    public class PrivilegeTreeListDTO
    {
        public bool Checked { get; set; }
        public string Id { get; set; }
        public string? ParentId { get; set; }

        [Required(ErrorMessage = "Emri i formës duhet të plotësohet")]
        public string FormName { get; set; }

        [Required(ErrorMessage = "Kodi i privilegjit duhet të plotësohet")]
        public string CapabilityCode { get; set; }
        public string? CapabilityDescription { get; set; }
    }
}
