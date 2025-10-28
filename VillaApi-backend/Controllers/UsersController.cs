using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VillaApi.Dtos;
using VillaApi.IRepository;
using VillaApi.Repository;

namespace VillaApi.Controllers
{
    [Route("api/")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        IUserRepository _userRepository;
        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        [Route("Users")]
        [Authorize]
        public async Task<ResponseDTO?> GetAll()
        {
            var items = await _userRepository.GetAll();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = items
            };
        }

        [HttpPost]
        [Route("Users/AutoFixAdmin")]
        public async Task<ResponseDTO?> AutoFixAdmin()
        {
            try
            {
                // Automatically fix admin status for user with username "admin"
                var adminUser = await _userRepository.GetByUsername("admin");
                if (adminUser != null)
                {
                    var result = await _userRepository.UpdateAdminStatus(adminUser.Id, true);
                    if (result)
                    {
                        return new ResponseDTO
                        {
                            IsSuccessfull = true,
                            Data = $"Admin user (ID:{adminUser.Id}) auto-fixed successfully"
                        };
                    }
                }
                
                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = "Admin user not found or could not be updated"
                };
            }
            catch (Exception ex)
            {
                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        [HttpPost]
        [Route("Register")]
        public async Task<ResponseDTO?> Register([FromBody] CreateUserRequestDTO request)
        {
            try
            {
                if (request == null)
                {
                    return new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "Request data is required."
                    };
                }
                
                // Debug logging
                Console.WriteLine($"Register attempt - Username: {request.Username}, Password: {(string.IsNullOrEmpty(request.Password) ? "EMPTY" : "PROVIDED")}, IsAdmin: {request.IsAdmin}");
                
                if (string.IsNullOrEmpty(request.Username))
                {
                    return new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "The username field is required."
                    };
                }
                
                if (string.IsNullOrEmpty(request.Password))
                {
                    return new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "The password field is required."
                    };
                }
                
                var response = await _userRepository.Register(request.Username, request.Password, request.IsAdmin);

                if (response)
                {
                    // After successful registration, create a token for the user
                    var user = await _userRepository.GetByUsername(request.Username);
                    if (user != null)
                    {
                        var tokenItem = new TokenService();
                        var token = tokenItem.CreateToken(user);

                        return new ResponseDTO
                        {
                            IsSuccessfull = true,
                            Data = token
                        };
                    }
                }

                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = "Regjistrimi dështoi"
                };
            }
            catch (MyException ex)
            {
                string errorMessage = ex.Message switch
                {
                    "6" => "Emri i përdoruesit është shumë i gjatë",
                    "7" => "Përdoruesi ekziston tashmë",
                    _ => "Gabim në regjistrim"
                };

                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = errorMessage
                };
            }
            catch (Exception ex)
            {
                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = "Gabim i papritur në regjistrim"
                };
            }
        }

        [HttpPost]
        [Route("Login")]
        [AllowAnonymous]
        public async Task<ResponseDTO?> Login([FromForm]LoginRequestDTO request)
        {
            try
            {
                var item = await _userRepository.Login(request);

                if(item is null)
                    return new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "Nuk jeni ne nderrim prandaj nuk keni qasje"
                    };

                var tokenItem = new TokenService();

                var token = tokenItem.CreateToken(item);

                return new ResponseDTO
                {
                    IsSuccessfull = true,
                    Data = token
                };
            }
            catch (MyException ex)
            {
                string errorMessage = ex.Message switch
                {
                    "8" => "Përdoruesi nuk ekziston",
                    "9" => "Fjalëkalimi është gabim",
                    "10" => "Përdoruesi nuk është aktiv",
                    _ => "Gabim në kyçje"
                };

                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = errorMessage
                };
            }
            catch (Exception ex)
            {
                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = "Gabim i papritur në kyçje"
                };
            }
        }

        [HttpPut]
        [Route("ChangePassword")]
        [Authorize]
        public async Task<ResponseDTO?> ChangePassword(int userId, string oldPassword, string password)
        {
            var item = await _userRepository.ChangePassword(userId, oldPassword, password);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = item
            };
        }

        [HttpPost]
        [Route("Users/Logout")]
        public async Task<ResponseDTO?> Logout(int userId)
        {
            var item = await _userRepository.Logout(userId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = item
            };
        }

        [HttpPost]
        [Route("Users/ResetLogout")]
        public async Task<ResponseDTO?> ResetLogout()
        {
            var item = await _userRepository.ResetLogout();

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = item
            };
        }


        [HttpPut]
        [Route("Users/UpdateStatus")]
        [Authorize]
        public async Task<ResponseDTO?> UpdateStatus(int userId, bool isActive)
        {
            var item = await _userRepository.UpdateStatus(userId, isActive);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = item
            };
        }

        [HttpDelete]
        [Route("Users/Remove")]
        [Authorize]
        public async Task<ResponseDTO?> Remove(int userId)
        {
            var item = await _userRepository.Remove(userId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = item
            };
        }

        [HttpPut]
        [Route("Users/SetDefaultPassword")]
        [Authorize]
        public async Task<ResponseDTO?> SetDefaultPassword(int userId)
        {
            var item = await _userRepository.SetDefaultPassword(userId);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = item
            };
        }

        [HttpPut]
        [Route("Users/UpdateAdminStatus")]
        [Authorize]
        public async Task<ResponseDTO?> UpdateAdminStatus(int userId, bool isAdmin)
        {
            var item = await _userRepository.UpdateAdminStatus(userId, isAdmin);

            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = item
            };
        }

        [HttpGet]
        [Route("TestConnection")]
        public ResponseDTO? TestConnection()
        {
            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = "Backend connection successful!"
            };
        }

        [HttpPost]
        [Route("Users/FixAdminUser")]
        public async Task<ResponseDTO?> FixAdminUser()
        {
            try
            {
                // Fix the admin user (ID:2) to have IsAdmin = true
                var result = await _userRepository.UpdateAdminStatus(2, true);
                
                if (result)
                {
                    return new ResponseDTO
                    {
                        IsSuccessfull = true,
                        Data = "Admin user (ID:2) fixed successfully"
                    };
                }
                else
                {
                    return new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "Failed to update admin user"
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        [HttpGet]
        [Route("TestAuth")]
        [Authorize]
        public async Task<ResponseDTO?> TestAuth()
        {
            return new ResponseDTO
            {
                IsSuccessfull = true,
                Data = "Authentication successful!"
            };
        }

        [HttpGet]
        [Route("Users/CheckAdmin")]
        [Authorize]
        public async Task<ResponseDTO?> CheckAdmin()
        {
            try
            {
                // Get current user from token
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "User ID not found in token"
                    };
                }

                var user = await _userRepository.GetById(userId);
                
                if (user == null)
                {
                    return new ResponseDTO
                    {
                        IsSuccessfull = false,
                        ErrorMessage = "User not found"
                    };
                }

                return new ResponseDTO
                {
                    IsSuccessfull = true,
                    Data = new { 
                        userId = user.Id,
                        username = user.Username,
                        isAdmin = user.IsAdmin,
                        isActive = user.IsActive
                    }
                };
            }
            catch (Exception ex)
            {
                return new ResponseDTO
                {
                    IsSuccessfull = false,
                    ErrorMessage = ex.Message
                };
            }
        }


    }
}
