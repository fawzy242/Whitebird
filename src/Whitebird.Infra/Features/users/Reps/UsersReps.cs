using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;
using Whitebird.Domain.Features.users.Entities;

namespace Whitebird.Infra.Features.users.Reps
{
    public class UsersReps
    {
        private readonly string _connectionString;

        public UsersReps(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WhitebirdDb") 
                                 ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<IEnumerable<UsersEntity>> GetAllUsers()
        {
            using var connection = CreateConnection();
            string sql = "SELECT Id, Name, Email FROM Users";
            var users = await connection.QueryAsync<UsersEntity>(sql);
            return users;
        }

        public async Task<UsersEntity> GetUserById(int id)
        {
            using var connection = CreateConnection();
            string sql = "SELECT Id, Name, Email FROM Users WHERE Id = @Id";
            return await connection.QueryFirstOrDefaultAsync<UsersEntity>(sql, new { Id = id }) 
                   ?? throw new InvalidOperationException($"User with Id {id} not found.");
        }
    }
}
