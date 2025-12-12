// File: AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Auth.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Common.Auth;
using Whitebird.Features.Common;

namespace Whitebird.Features.Auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<LoginResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _authService.LoginAsync(request);
            return this.HandleResult(result);
        }

        [HttpPost("forgot-password")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _authService.ForgotPasswordAsync(request.Email);
            return this.HandleResult(result);
        }

        [HttpPost("reset-password")]
        [Authorize]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var result = await _authService.ResetPasswordAsync(userId, request);
            return this.HandleResult(result);
        }

        [HttpPost("reset-password-with-token")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPasswordWithToken([FromBody] ResetPasswordWithTokenRequest request)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _authService.ResetPasswordWithTokenAsync(request);
            return this.HandleResult(result);
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(Result<UserDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var result = await _authService.GetUserByIdAsync(userId);
            return this.HandleResult(result);
        }

        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var result = await _authService.ChangePasswordAsync(userId, request);
            return this.HandleResult(result);
        }
    }
}