namespace VillaApi.Dtos
{
    public class ProductCategoryDTO
    {
        public string Code { get; set; }

        public string Description { get; set; }
        public bool IsActive { get; set; } = true;

        public string EnteredBy { get; set; }

        public DateTime EnteredOn { get; set; } = DateTime.Now;
    }
}
