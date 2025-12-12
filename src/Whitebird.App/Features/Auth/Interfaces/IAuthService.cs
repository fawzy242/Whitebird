// File: IAuthService.cs
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Common.Auth;

namespace Whitebird.App.Features.Auth.Interfaces
{
    public interface IAuthService
    {
        Task<Result<LoginResponse>> LoginAsync(LoginRequest request);
        Task<Result> ForgotPasswordAsync(string email);
        Task<Result> ResetPasswordAsync(int userId, ResetPasswordRequest request);
        Task<Result> ResetPasswordWithTokenAsync(ResetPasswordWithTokenRequest request);
        Task<Result<UserDto>> GetUserByIdAsync(int userId);
        Task<Result> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    }
}