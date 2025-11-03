using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Whitebird.Domain.Features.fund.Entities;

namespace Whitebird.Infra.Features.fund.Reps
{
    public class FundReps
    {
        private readonly string _connectionString;

        public FundReps(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WhitebirdDb")
                                 ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<IEnumerable<FundEntity>> GetShowData()
        {
            using var connection = CreateConnection();
            string sql = "Select FundPK, Id, Name, EntryTime as CreatedAt, UpdateTime as UpdatedAt,1 as IsActive FROM Fund";
            return await connection.QueryAsync<FundEntity>(sql);
        }
    }
}
