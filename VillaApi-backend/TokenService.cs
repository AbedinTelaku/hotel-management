using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VillaApi.Dtos;
using VillaApi.Models;

namespace VillaApi
{
    public static class TokenKeys
    {
        public const int ExpirationMinutes = 500;
        public const string _mySecret = "#AppleBlaCk&4Vill@2at@81rt$84K%285Ep";
        public const string _myIssuer = "AppleBlaCk";
        public const string _myAudience = "AppleBlaCk_Villa_App";
        public const string _myTitle = "AppleBlaCk_ApiForVilla";

    }
    public class TokenService
    {
        private SymmetricSecurityKey _mySecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TokenKeys._mySecret));
        
        public string CreateToken(UserDTO user)
        {
            var token = CreateJwtToken(
                CreateClaims(user),
                CreateSigningCredentials(),
                DateTime.UtcNow.AddMinutes(TokenKeys.ExpirationMinutes)
            );
            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(token);
        }

        private JwtSecurityToken CreateJwtToken(List<Claim> claims, SigningCredentials credentials,
            DateTime expiration) =>
            new(
                TokenKeys._myIssuer,
                TokenKeys._myAudience,
                claims,
                expires: expiration,
                signingCredentials: credentials
            );

        private List<Claim> CreateClaims(UserDTO user)
        {
            try
            {
                var claims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, "TokenForVillaApi_AppleBlaCk"),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim("isAdmin", user.IsAdmin.ToString())
                };
                return claims;
            }
            catch (Exception)
            {
                throw;
            }
        }
        private SigningCredentials CreateSigningCredentials()
        {
            return new SigningCredentials(
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(TokenKeys._mySecret)
                ),
                SecurityAlgorithms.HmacSha256
            );
        }

        public bool ValidateCurrentToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    RequireExpirationTime = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(5), // Reduced from 500 minutes to 5 minutes
                    ValidateIssuerSigningKey = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = TokenKeys._myIssuer,
                    ValidAudience = TokenKeys._myAudience,
                    IssuerSigningKey = _mySecurityKey,
                    ValidateActor = false,
                    ValidateTokenReplay = false
                }, out SecurityToken validatedToken);
            }
            catch
            {
                return false;
            }
            return true;
        }

    }
    
}
