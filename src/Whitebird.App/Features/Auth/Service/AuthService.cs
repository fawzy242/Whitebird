// File: AuthService.cs
using Whitebird.App.Features.Auth.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Common.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Whitebird.Domain.Features.Users.Entities;
using Whitebird.Infra.Features.Auth;

namespace Whitebird.App.Features.Auth.Service
{
    public class AuthService : IAuthService
    {
        private readonly IAuthReps _authRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IAuthReps authRepository,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _authRepository = authRepository;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _authRepository.GetUserByEmailAsync(request.Email);

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return Result<LoginResponse>.Failure("Invalid email or password");
                }

                if (!user.IsActive)
                {
                    return Result<LoginResponse>.Failure("Account is inactive");
                }

                // Update last login
                await _authRepository.UpdateLastLoginAsync(user.UserId);

                var token = GenerateJwtToken(user);
                var expiryMinutes = _configuration.GetValue<int>("Jwt:ExpiryInMinutes", 60);

                var response = new LoginResponse
                {
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                    User = new UserDto
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        FullName = user.FullName,
                        RoleId = user.RoleId
                    }
                };

                return Result<LoginResponse>.Success(response, "Login successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for email: {Email}", request.Email);
                return Result<LoginResponse>.Failure("Login failed. Please try again.");
            }
        }

        public async Task<Result> ForgotPasswordAsync(string email)
        {
            try
            {
                var user = await _authRepository.GetUserByEmailAsync(email);

                if (user == null || !user.IsActive)
                {
                    // Untuk keamanan, tetap return success meski email tidak ditemukan
                    return Result.Success("If your email is registered, you will receive a password reset link");
                }

                // Generate reset token (6 digit)
                var resetToken = new Random().Next(100000, 999999).ToString();
                var resetTokenExpiry = DateTime.UtcNow.AddHours(1);

                // Update user with reset token
                var updated = await _authRepository.UpdateResetTokenAsync(
                    user.UserId,
                    resetToken,
                    resetTokenExpiry);

                if (!updated)
                {
                    return Result.Failure("Failed to process password reset request");
                }

                // Kirim email reset password
                await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken, user.FullName);

                return Result.Success("Password reset email sent");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Forgot password error for email: {Email}", email);
                return Result.Failure("Failed to process request. Please try again.");
            }
        }

        public async Task<Result> ResetPasswordAsync(int userId, ResetPasswordRequest request)
        {
            try
            {
                var user = await _authRepository.GetUserByIdAsync(userId);
                if (user == null || !user.IsActive)
                    return Result.Failure("User not found");

                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                    return Result.Failure("Current password is incorrect");

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                var updated = await _authRepository.UpdatePasswordAsync(userId, passwordHash);

                if (!updated)
                    return Result.Failure("Failed to reset password");

                return Result.Success("Password reset successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Reset password error for user ID: {UserId}", userId);
                return Result.Failure("Failed to reset password. Please try again.");
            }
        }

        public async Task<Result> ResetPasswordWithTokenAsync(ResetPasswordWithTokenRequest request)
        {
            try
            {
                var user = await _authRepository.GetUserByResetTokenAsync(request.Email, request.ResetToken);

                if (user == null)
                    return Result.Failure("Invalid or expired reset token");

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                var updated = await _authRepository.UpdatePasswordAsync(user.UserId, passwordHash);

                if (!updated)
                    return Result.Failure("Failed to reset password");

                // Clear reset token
                await _authRepository.ClearResetTokenAsync(user.UserId);

                return Result.Success("Password reset successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Reset password with token error for email: {Email}", request.Email);
                return Result.Failure("Failed to reset password. Please try again.");
            }
        }

        public async Task<Result<UserDto>> GetUserByIdAsync(int userId)
        {
            try
            {
                var user = await _authRepository.GetUserByIdAsync(userId);
                if (user == null || !user.IsActive)
                    return Result<UserDto>.Failure("User not found");

                var userDto = new UserDto
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    FullName = user.FullName,
                    RoleId = user.RoleId
                };

                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get user by ID error: {UserId}", userId);
                return Result<UserDto>.Failure("Failed to get user information");
            }
        }

        public async Task<Result> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            try
            {
                var user = await _authRepository.GetUserByIdAsync(userId);
                if (user == null || !user.IsActive)
                    return Result.Failure("User not found");

                if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
                    return Result.Failure("Old password is incorrect");

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                var updated = await _authRepository.UpdatePasswordAsync(userId, passwordHash);

                if (!updated)
                    return Result.Failure("Failed to change password");

                return Result.Success("Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Change password error for user ID: {UserId}", userId);
                return Result.Failure("Failed to change password. Please try again.");
            }
        }

        private string GenerateJwtToken(UsersEntity user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "Whitebird";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "WhitebirdUsers";
            var expiryMinutes = _configuration.GetValue<int>("Jwt:ExpiryInMinutes", 60);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.RoleId ?? "User"),
                new Claim("userId", user.UserId.ToString()), // Tambahkan untuk backward compatibility
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}