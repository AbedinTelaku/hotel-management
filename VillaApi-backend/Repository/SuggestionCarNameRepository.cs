using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Security.Claims;
using VillaApi.Dtos;
using VillaApi.IRepository;
using VillaApi.Models;

namespace VillaApi.Repository
{
    public class SuggestionCarNameRepository : ISuggestionCarNameRepository
    {
        MyDbContext _context;
        private readonly MyMessages _myMessages;
        
        public SuggestionCarNameRepository(MyDbContext context, MyMessages myMessages)
        {
            _context = context;
            _myMessages = myMessages;
        }
        public async Task<IEnumerable<string>> GetAll()
        {
            return await _context.SuggestionCarNames
                    .Select(s => s.CarName)
                    .ToListAsync();
        }

        public async Task<bool> Add(string carName)
        {
            if(carName.Length > 50)
                throw new MyExceptionMessage(_myMessages.GetMessage(6)
                                        .Replace("{0}", "Emri i veturës")
                                        .Replace("{1}", "50"));

            if (await _context.SuggestionCarNames.AnyAsync(s => s.CarName == carName))
                throw new MyException(5);

            await _context.SuggestionCarNames.AddAsync(new SuggestionCarName { CarName = carName });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Remove(string carName)
        {
            var obj = await _context.SuggestionCarNames.FirstOrDefaultAsync(s => s.CarName == carName);

            if (obj is null)
                throw new MyException(4);

           _context.SuggestionCarNames.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
