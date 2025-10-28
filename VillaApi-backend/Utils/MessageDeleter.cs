using Microsoft.EntityFrameworkCore;
using VillaApi.Models;

namespace VillaApi.Utils
{
    public class MessageDeleter
    {
        private readonly MyDbContext _context;

        public MessageDeleter(MyDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Deletes all messages from the database
        /// </summary>
        /// <returns>Number of messages deleted</returns>
        public async Task<int> DeleteAllMessages()
        {
            var messages = await _context.Messages.ToListAsync();
            var count = messages.Count;

            if (count > 0)
            {
                _context.Messages.RemoveRange(messages);
                await _context.SaveChangesAsync();
            }

            return count;
        }

        /// <summary>
        /// Deletes a specific message by code
        /// </summary>
        /// <param name="code">Message code to delete</param>
        /// <returns>True if deleted, false if not found</returns>
        public async Task<bool> DeleteMessageByCode(string code)
        {
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Code == code);
            
            if (message == null)
                return false;

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            
            return true;
        }

        /// <summary>
        /// Deletes messages that contain specific text
        /// </summary>
        /// <param name="searchText">Text to search for in messages</param>
        /// <returns>Number of messages deleted</returns>
        public async Task<int> DeleteMessagesContaining(string searchText)
        {
            var messages = await _context.Messages
                .Where(m => m.Message.Contains(searchText))
                .ToListAsync();

            var count = messages.Count;

            if (count > 0)
            {
                _context.Messages.RemoveRange(messages);
                await _context.SaveChangesAsync();
            }

            return count;
        }

        /// <summary>
        /// Gets all messages for review before deletion
        /// </summary>
        /// <returns>List of all messages</returns>
        public async Task<List<Messages>> GetAllMessages()
        {
            return await _context.Messages.ToListAsync();
        }

        /// <summary>
        /// Gets count of total messages
        /// </summary>
        /// <returns>Total number of messages</returns>
        public async Task<int> GetMessageCount()
        {
            return await _context.Messages.CountAsync();
        }
    }
}
