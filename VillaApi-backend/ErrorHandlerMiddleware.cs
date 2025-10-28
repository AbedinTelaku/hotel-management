using VillaApi.Repository;
using VillaApi.IRepository;

namespace VillaApi
{
    public class ErrorHandlerMiddleware : IMiddleware
    {
        private readonly ILogger<ErrorHandlerMiddleware> _logger;
        private readonly MyMessages _myMessages;
        
        public ErrorHandlerMiddleware(ILogger<ErrorHandlerMiddleware> logger, MyMessages myMessages)
        {
            _logger = logger;
            _myMessages = myMessages;
        }
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
			try
			{
				await next(context);
			}
            catch (MyException ex)
            {
                context.Response.StatusCode = 200;

                var messageText = _myMessages.GetMessageByCode(ex.Message);

                await context.Response.WriteAsJsonAsync<ResponseDTO>(new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = messageText ?? ex.Message
                });
            }
            catch (MyExceptionMessage ex)
            {
                context.Response.StatusCode = 200;

                await context.Response.WriteAsJsonAsync<ResponseDTO>(new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = ex.Message
                });
            }
            catch (Exception ex)
			{
                string message = ex.InnerException != null ?
                                (ex.InnerException.InnerException != null ? ex.InnerException.InnerException.Message : ex.InnerException.Message)
                                : ex.Message;

                _logger.LogError(message);
				context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync<ResponseDTO>(new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = ex.Message
                });
            }
        }
    }

	public class MyException : Exception
	{
		public MyException(int messageCode) : base(messageCode.ToString()) { }
    }

    public class MyExceptionMessage : Exception
    {
        public MyExceptionMessage(string message) : base(message) { }
    }

    public class MyMessages
    {
        private readonly IMessageRepository _messageRepository;

        public MyMessages(IMessageRepository messageRepository)
        {
            _messageRepository = messageRepository;
        }

        public string GetMessage(int code)
        {
            var messageText = _messageRepository.GetMessageByCode(code.ToString());
            return messageText ?? "Gabim";
        }

        public string GetMessageByCode(string code)
        {
            var messageText = _messageRepository.GetMessageByCode(code);
            return messageText ?? "Gabim";
        }
    }

}
