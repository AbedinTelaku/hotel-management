namespace VillaApi
{
    public class ResponseDTO
    {
        public bool IsSuccessfull { get; set; } 

        public string? ErrorMessage { get; set; }

        public object? Data { get; set; }
    }
}
