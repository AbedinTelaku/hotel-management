namespace VillaApi.Dtos
{
    public class StockDTO
    {
        public string Category { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int OrderNo { get; set; }
        public int CurrentStock { get; set; }
        public int ReservedStock { get; set; }
        public int AvailableStock { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
