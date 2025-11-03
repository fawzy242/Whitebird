using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;
using Whitebird.Domain.Features.login.Entities;

namespace Whitebird.Infra.Features.login.Reps
{
    public class LoginReps
    {
        private readonly string _connectionString;

        public LoginReps(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WhitebirdDb")
                                 ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<IEnumerable<Login>> Quest()
        {
            using var connection = CreateConnection();
            string sql = "SELECT Id, Name, Email FROM Users";
            return await connection.QueryAsync<Login>(sql);
        }
    }
}
