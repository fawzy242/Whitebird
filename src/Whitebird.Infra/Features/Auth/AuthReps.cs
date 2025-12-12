using Microsoft.Extensions.Configuration;
using Whitebird.Domain.Features.Users.Entities;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Whitebird.Infra.Features.Auth
{
    public class AuthReps : IAuthReps
    {
        private readonly IConfiguration _configuration;

        public AuthReps(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        private string GetConnectionString()
        {
            var connectionString = _configuration.GetConnectionString("WhitebirdDb");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
            }
            return connectionString;
        }

        private async Task<SqlConnection> CreateConnectionAsync()
        {
            var connection = new SqlConnection(GetConnectionString());
            await connection.OpenAsync();
            return connection;
        }

        public async Task<UsersEntity?> GetUserByEmailAsync(string email)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                SELECT * 
                FROM Users 
                WHERE Email = @Email 
                AND IsActive = 1";

            return await connection.QuerySingleOrDefaultAsync<UsersEntity?>(sql, new { Email = email });
        }

        public async Task<UsersEntity?> GetUserByIdAsync(int userId)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                SELECT * 
                FROM Users 
                WHERE UserId = @UserId 
                AND IsActive = 1";

            return await connection.QuerySingleOrDefaultAsync<UsersEntity?>(sql, new { UserId = userId });
        }

        public async Task<UsersEntity?> GetUserByResetTokenAsync(string email, string resetToken)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                SELECT * 
                FROM Users 
                WHERE Email = @Email 
                AND ResetToken = @ResetToken 
                AND ResetTokenExpiry > GETUTCDATE()
                AND IsActive = 1";

            return await connection.QuerySingleOrDefaultAsync<UsersEntity?>(sql, new
            {
                Email = email,
                ResetToken = resetToken
            });
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                SELECT COUNT(1) 
                FROM Users 
                WHERE Email = @Email 
                AND IsActive = 1";

            var count = await connection.ExecuteScalarAsync<int>(sql, new { Email = email });
            return count > 0;
        }

        public async Task<bool> UpdateResetTokenAsync(int userId, string resetToken, DateTime expiry)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                UPDATE Users 
                SET ResetToken = @ResetToken,
                    ResetTokenExpiry = @Expiry,
                    ModifiedDate = GETUTCDATE()
                WHERE UserId = @UserId
                AND IsActive = 1";

            var affected = await connection.ExecuteAsync(sql, new
            {
                UserId = userId,
                ResetToken = resetToken,
                Expiry = expiry
            });

            return affected > 0;
        }

        public async Task<bool> UpdatePasswordAsync(int userId, string passwordHash)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                UPDATE Users 
                SET PasswordHash = @PasswordHash,
                    ResetToken = NULL,
                    ResetTokenExpiry = NULL,
                    LastPasswordChange = GETUTCDATE(),
                    ModifiedDate = GETUTCDATE()
                WHERE UserId = @UserId
                AND IsActive = 1";

            var affected = await connection.ExecuteAsync(sql, new
            {
                UserId = userId,
                PasswordHash = passwordHash
            });

            return affected > 0;
        }

        public async Task<bool> ClearResetTokenAsync(int userId)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                UPDATE Users 
                SET ResetToken = NULL,
                    ResetTokenExpiry = NULL,
                    ModifiedDate = GETUTCDATE()
                WHERE UserId = @UserId";

            var affected = await connection.ExecuteAsync(sql, new { UserId = userId });
            return affected > 0;
        }

        public async Task<bool> UpdateLastLoginAsync(int userId)
        {
            using var connection = await CreateConnectionAsync();

            var sql = @"
                UPDATE Users 
                SET LastLogin = GETUTCDATE(),
                    ModifiedDate = GETUTCDATE()
                WHERE UserId = @UserId
                AND IsActive = 1";

            var affected = await connection.ExecuteAsync(sql, new { UserId = userId });
            return affected > 0;
        }
    }
}