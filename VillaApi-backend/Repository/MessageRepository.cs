using Microsoft.EntityFrameworkCore;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class MessageRepository : IMessageRepository
    {
        private readonly MyDbContext _context;

        public MessageRepository(MyDbContext context)
        {
            _context = context;
        }

        public async Task<string?> GetMessage(string code)
        {
            return await _context.Messages.Where(m => m.Code == code).Select(s => s.Message).FirstOrDefaultAsync();
        }

        public string? GetMessageByCode(string code)
        {
            return _context.Messages.FirstOrDefault(s => s.Code == code)?.Message;
        }

        public async Task<List<Messages>> GetAllMessages()
        {
            return await _context.Messages.ToListAsync();
        }

        public async Task<bool> DeleteMessage(string code)
        {
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Code == code);
            
            if (message == null)
                return false;

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> DeleteAllMessages()
        {
            var allMessages = await _context.Messages.ToListAsync();
            
            if (!allMessages.Any())
                return false;

            _context.Messages.RemoveRange(allMessages);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> AddMessage(string code, string message)
        {
            var existingMessage = await _context.Messages.FirstOrDefaultAsync(m => m.Code == code);
            
            if (existingMessage != null)
                return false;

            var newMessage = new Messages
            {
                Code = code,
                Message = message
            };

            await _context.Messages.AddAsync(newMessage);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> UpdateMessage(string code, string message)
        {
            var existingMessage = await _context.Messages.FirstOrDefaultAsync(m => m.Code == code);
            
            if (existingMessage == null)
                return false;

            existingMessage.Message = message;
            await _context.SaveChangesAsync();
            
            return true;
        }
    }
}
