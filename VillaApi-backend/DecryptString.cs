using System.Security.Cryptography;
using System.Text;

namespace VillaApi;

public static class AesEncryption
{
    private static string _password = string.Empty;
    private static string GetPassword()
    {
        if (string.IsNullOrWhiteSpace(_password))
            _password = FingerPrint.Value();

        return _password;
    }

    public static string Password => GetPassword();


    // Encrypt a plain text string using AES and a password
    public static string Encrypt(string plainText)
    {
        if(string.IsNullOrWhiteSpace(plainText))
            return string.Empty;

        // Generate a random salt
        byte[] salt = RandomNumberGenerator.GetBytes(16);

        // Derive a 256-bit AES key from the password and salt
        using var keyDerivation = new Rfc2898DeriveBytes(Password, salt, 100_000, HashAlgorithmName.SHA256);
        byte[] key = keyDerivation.GetBytes(32); // AES-256 key

        // Create AES with random IV
        using var aes = Aes.Create();
        aes.Key = key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();

        // Write salt + IV first so we can use them during decryption
        ms.Write(salt, 0, salt.Length);
        ms.Write(aes.IV, 0, aes.IV.Length);

        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }

        return Convert.ToBase64String(ms.ToArray());
    }

    // Decrypt the string using AES and the same password
    public static string Decrypt(string encryptedText)
    {
        if (string.IsNullOrWhiteSpace(encryptedText))
            return string.Empty;

        byte[] fullCipher;
        try
        {
            fullCipher = Convert.FromBase64String(encryptedText);
        }
        catch (FormatException)
        {
            // Value is not encrypted; return as-is.
            return encryptedText;
        }

        // Extract salt and IV (first 16 + 16 bytes)
        byte[] salt = new byte[16];
        byte[] iv = new byte[16];
        Array.Copy(fullCipher, 0, salt, 0, salt.Length);
        Array.Copy(fullCipher, salt.Length, iv, 0, iv.Length);

        // Derive key from the password and same salt
        using var keyDerivation = new Rfc2898DeriveBytes(Password, salt, 100_000, HashAlgorithmName.SHA256);
        byte[] key = keyDerivation.GetBytes(32);

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream(fullCipher, salt.Length + iv.Length, fullCipher.Length - salt.Length - iv.Length);
        using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);

        return sr.ReadToEnd();
    }
}




/// <summary>
/// Generates a 16 byte Unique Identification code of a computer
/// Example: 4876-8DB5-EE85-69D3-FE52-8CF7-395D-2EA9
/// </summary>
public class FingerPrint
{
    private static string fingerPrint = string.Empty;
    public static string Value()
    {
        if (string.IsNullOrEmpty(fingerPrint))
        {
            fingerPrint = GetHash("CPU >> " + cpuId() + "\nBIOS >> " +
                    biosId() + "\nBASE >> " + baseId() +
                    //"\nDISK >> "+ diskId() + "\nVIDEO >> " + 
                    videoId() + "\nMAC >> " + macId()
                                 );
        }
        return fingerPrint;
    }
    private static string GetHash(string s)
    {
        MD5 sec = new MD5CryptoServiceProvider();
        ASCIIEncoding enc = new ASCIIEncoding();
        byte[] bt = enc.GetBytes(s);
        return GetHexString(sec.ComputeHash(bt));
    }
    private static string GetHexString(byte[] bt)
    {
        string s = string.Empty;
        for (int i = 0; i < bt.Length; i++)
        {
            byte b = bt[i];
            int n, n1, n2;
            n = (int)b;
            n1 = n & 15;
            n2 = (n >> 4) & 15;
            if (n2 > 9)
                s += ((char)(n2 - 10 + (int)'A')).ToString();
            else
                s += n2.ToString();
            if (n1 > 9)
                s += ((char)(n1 - 10 + (int)'A')).ToString();
            else
                s += n1.ToString();
            if ((i + 1) != bt.Length && (i + 1) % 2 == 0) s += "-";
        }
        return s;
    }
    #region Original Device ID Getting Code
    //Return a hardware identifier
    private static string identifier
    (string wmiClass, string wmiProperty, string wmiMustBeTrue)
    {
        string result = "";
        System.Management.ManagementClass mc =
    new System.Management.ManagementClass(wmiClass);
        System.Management.ManagementObjectCollection moc = mc.GetInstances();
        foreach (System.Management.ManagementObject mo in moc)
        {
            if (mo[wmiMustBeTrue].ToString() == "True")
            {
                //Only get the first one
                if (result == "")
                {
                    try
                    {
                        result = mo[wmiProperty].ToString();
                        break;
                    }
                    catch
                    {
                    }
                }
            }
        }
        return result;
    }
    //Return a hardware identifier
    private static string identifier(string wmiClass, string wmiProperty)
    {
        string result = "";
        System.Management.ManagementClass mc =
    new System.Management.ManagementClass(wmiClass);
        System.Management.ManagementObjectCollection moc = mc.GetInstances();
        foreach (System.Management.ManagementObject mo in moc)
        {
            //Only get the first one
            if (result == "")
            {
                try
                {
                    result = mo[wmiProperty]?.ToString() ?? "";
                    break;
                }
                catch
                {
                }
            }
        }
        return result;
    }
    private static string cpuId()
    {
        //Uses first CPU identifier available in order of preference
        //Don't get all identifiers, as it is very time consuming
        string retVal = identifier("Win32_Processor", "UniqueId");
        if (retVal == "") //If no UniqueID, use ProcessorID
        {
            retVal = identifier("Win32_Processor", "ProcessorId");
            if (retVal == "") //If no ProcessorId, use Name
            {
                retVal = identifier("Win32_Processor", "Name");
                if (retVal == "") //If no Name, use Manufacturer
                {
                    retVal = identifier("Win32_Processor", "Manufacturer");
                }
                //Add clock speed for extra security
                retVal += identifier("Win32_Processor", "MaxClockSpeed");
            }
        }
        return retVal;
    }
    //BIOS Identifier
    public static string biosId()
    {
        return identifier("Win32_BIOS", "Manufacturer")
        + identifier("Win32_BIOS", "SMBIOSBIOSVersion")
        + identifier("Win32_BIOS", "IdentificationCode")
        + identifier("Win32_BIOS", "SerialNumber")
        + identifier("Win32_BIOS", "ReleaseDate")
        + identifier("Win32_BIOS", "Version");
    }
    //Main physical hard drive ID
    public static string diskId()
    {
        return identifier("Win32_DiskDrive", "Model")
        + identifier("Win32_DiskDrive", "Manufacturer")
        + identifier("Win32_DiskDrive", "Signature")
        + identifier("Win32_DiskDrive", "TotalHeads");
    }
    //Motherboard ID
    public static string baseId()
    {
        return identifier("Win32_BaseBoard", "Model")
        + identifier("Win32_BaseBoard", "Manufacturer")
        + identifier("Win32_BaseBoard", "Name")
        + identifier("Win32_BaseBoard", "SerialNumber");
    }
    //Primary video controller ID
    private static string videoId()
    {
        return identifier("Win32_VideoController", "DriverVersion")
        + identifier("Win32_VideoController", "Name");
    }
    //First enabled network card ID
    public static string macId()
    {
        return identifier("Win32_NetworkAdapterConfiguration",
            "MACAddress", "IPEnabled");
    }
    #endregion
}

