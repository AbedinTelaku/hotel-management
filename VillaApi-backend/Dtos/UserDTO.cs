namespace VillaApi.Dtos
{
    public class UserDTO
    {
    public int Id { get; set; }
        public string Username { get; set; }
        public bool IsActive { get; set; }
        public bool IsAdmin { get; set; }
    }
}
