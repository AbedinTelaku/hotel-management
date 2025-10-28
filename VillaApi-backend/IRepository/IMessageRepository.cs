using VillaApi.Models;

namespace VillaApi.IRepository
{
    public interface IMessageRepository
    {
        Task<string?> GetMessage(string code);
        string? GetMessageByCode(string code);
        Task<List<Messages>> GetAllMessages();
        Task<bool> DeleteMessage(string code);
        Task<bool> DeleteAllMessages();
        Task<bool> AddMessage(string code, string message);
        Task<bool> UpdateMessage(string code, string message);
    }
}
