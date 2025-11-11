
using Azure;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using NuGet.Protocol;
using System;
using VillaApi.Hubs;
using VillaApi.IRepository;

namespace VillaApi
{
    public class BlockTokenMiddleware : IMiddleware
    {
        private readonly ILogger<BlockTokenMiddleware> _logger;
        private readonly MyDbContext _context;
        private readonly IHubContext<RoomsHub> _hubContext;
        public BlockTokenMiddleware(ILogger<BlockTokenMiddleware> logger,
                                MyDbContext myContext,
                                IHubContext<RoomsHub> hubContext)
        {
            _logger = logger;
            _context = myContext;
            _hubContext = hubContext;
        }
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var accessToken = context.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrWhiteSpace(accessToken))
            {
                var toBeBlocked = await _context.BlockTokens.AnyAsync(x => x.Token == accessToken.Replace("Bearer ", ""), context.RequestAborted);

                if (toBeBlocked)
                {
                    _logger.LogError("Token in block list tried to use the api.Token is: " + accessToken, accessToken);

                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";

                    await _hubContext.Clients.Client(accessToken.Replace("Bearer ", ""))
                                .SendAsync("ForceLogout", "You have been disconnected by admin.");

                    await context.Response.WriteAsJsonAsync<ResponseDTO>(new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "Nuk keni qasje ne sistem, ju lutem bejeni login perseri"
                    });

                    return;
                }
            }

            await next(context);
        }
    }
}
