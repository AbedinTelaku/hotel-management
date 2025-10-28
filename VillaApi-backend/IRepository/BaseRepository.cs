using NuGet.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace VillaApi.IRepository
{
    public abstract class BaseRepository
    {
        protected MyDbContext _context;
        protected IHttpContextAccessor _httpContextAccessor;
        public BaseRepository(MyDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public int GetUserIdFromToken()
        {
            var authHeader = _httpContextAccessor.HttpContext.Request.Headers.Authorization.ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                throw new MyException(12);
                
            var token = authHeader.Substring(7); // Remove "Bearer " prefix

            if (new TokenService().ValidateCurrentToken(token) == false)
                throw new MyException(12);

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

            if (securityToken is null)
                throw new MyException(11);

            var stringClaimValue = securityToken.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value;

            if (string.IsNullOrWhiteSpace(stringClaimValue))
                throw new MyException(11);

            return int.TryParse(stringClaimValue, out int _valId) ? _valId : 0;
        }
    }
}
