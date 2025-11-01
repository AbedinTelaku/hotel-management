
using VillaApi.Repository;

namespace VillaApi
{
    public class BackgroundServiceForLicense : BackgroundService
    {
        private readonly LicenseInformation _license;
        private readonly IConfiguration _configuration;
        private readonly string _publicKey;
        public BackgroundServiceForLicense(IConfiguration configuration, LicenseInformation licenseInformation)
        {
            _configuration = configuration;
            _license = licenseInformation;
            _publicKey = _configuration.GetValue<string>("LicenseKey") ?? "";
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested) 
            {
                Console.WriteLine("Kontrolli per license: " + DateTime.Now.ToString("dd.MM.yyyy HH:mm"));

                var isValid = _license.ReadLicense(_publicKey);

                if (isValid)
                    Console.WriteLine("Licensa eshte aktive deri me daten: " + _license.ExpireAt.ToString("dd.MM.yyyy"));
                else
                    Console.WriteLine("Licensa nuk eshte valide, kontaktoni programerin");


                await Task.Delay(TimeSpan.FromHours(_license.NextCheckInHours), stoppingToken);
            }
        }
    }
}
