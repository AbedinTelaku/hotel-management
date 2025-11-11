using Portable.Licensing;
using Portable.Licensing.Validation;
using System.Xml;

namespace VillaApi.Repository
{
    public class LicenseInformation
    {
        private readonly string LicenseKey = "";

        public LicenseInformation(string licenseKey)
        {
            LicenseKey = licenseKey;
        }

        public bool IsValid { get; private set; } = true;

        public DateTime ExpireAt { get; private set; } = DateTime.Today.AddDays(5);

        public DateTime LastCheck { get; private set; } = DateTime.Now.AddDays(-1);
        
        public int NextCheckInHours { get; private set; } = 24;

        public bool ShowMessageAlert { get; private set; } = false;
        public bool AlertOpen { get; private set; } = false;

        public bool ReadLicense(string publicKey)
        {
            try
            {
                var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "license.xml");
                using (XmlReader reader = XmlReader.Create(path))
                { 
                    var license = License.Load(reader);

                    license.Validate()
                        .ExpirationDate()
                        .And()
                       // .Signature(publicKey)
                        .Signature(LicenseKey)
                        .AssertValidLicense(); // throws if invalid

                    if (license.Expiration > DateTime.Now)
                    {
                        LastCheck = DateTime.Now;
                        IsValid = true;
                        ExpireAt = license.Expiration;
                        RythomOfCheck();
                        return true;
                    }
                }
            }
            catch
            {
            }

            ShowMessageAlert = true;
            AlertOpen = false;
            LastCheck = DateTime.Now;
            IsValid = false;
            return false;
        }

        private void RythomOfCheck()
        {
            try
            {
                var varibale = ExpireAt - LastCheck;

                if (varibale.TotalDays > 5)
                    return;


                NextCheckInHours = 3;
                ShowMessageAlert = true;
                AlertOpen = false;
            }
            catch
            {
            }
        }


        public string GetMessgeToDisplay()
        {
            AlertOpen = true;
            string muaji = ExpireAt.Month switch
            {
                1 => "Janar",
                2 => "Shkurt",
                3 => "Mars",
                4 => "Prill",
                5 => "Maj",
                6 => "Qershor",
                7 => "Korrik",
                8 => "Gusht",
                9 => "Shtator",
                10 => "Tetor",
                11 => "Nentor",
                12 => "Dhjetor",
                _ => ""
            };
            string messageText = $"Licensa do te skadoj me daten {ExpireAt.Day} {muaji}";
            messageText += "\nJu lutem kontaktoni me programerin per te vazhduar te shfrytezoni aplikacionin";
            messageText += "\nAbedini:  049/658-213";
            messageText += "\nMuhameti:  049/880-446";

            return messageText;
        }

    }
}
