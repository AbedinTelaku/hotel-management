
using System.Security.Cryptography.X509Certificates;
using VillaApi.IRepository;

namespace VillaApi
{ 
    public class BlockTokenBackgroundService(
                        IServiceProvider serviceProvider)

        : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = serviceProvider.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<IUserRepository>();

                await repo.DeleteExpireTokens(stoppingToken);

                await Task.Delay(TimeSpan.FromHours(1));
            }
        }
    }
}
