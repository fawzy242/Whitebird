using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Whitebird.Domain.Features.AssetTransactions.View;

namespace Whitebird.Infra.Features.AssetTransactions
{
    public class AssetTransactionsReps : IAssetTransactionsReps
    {
        private readonly string _connectionString;

        public AssetTransactionsReps(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WhitebirdDb")
                                 ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<AssetTransactionsListViewModel> GetByIdAsync(int assetTransactionsId)
        {
            using var connection = CreateConnection();
            string sql = $@"select A.AssetTransactionsId,A.AssetId,B.AssetCode,B.AssetName,A.Status,C.FullName as FromEmployeeName, C.FullName as ToEmployeeName, A.TransactionDate, null as Status
from AssetTransactions A
join Asset B on A.AssetId = B.AssetId and B.IsActive = 1
join Employee C on A.FromEmployeeId = C.EmployeeId and C.IsActive = 1
join Employee D on A.ToEmployeeId = D.EmployeeId and D.IsActive = 1

where A.AssetTransactionsId = @AssetTransactionsId";
            var param = new { AssetTransactionsId = assetTransactionsId };
            return await connection.QueryFirstOrDefaultAsync<AssetTransactionsListViewModel>(sql, param);
        }

        public async Task<IEnumerable<AssetTransactionsListViewModel>> GetAllAsync()
        {
            using var connection = CreateConnection();
            string sql = $@"select A.AssetTransactionsId,A.AssetId,B.AssetCode,B.AssetName,A.Status,C.FullName as FromEmployeeName, C.FullName as ToEmployeeName, A.TransactionDate, null as Status
from AssetTransactions A
join Asset B on A.AssetId = B.AssetId and B.IsActive = 1
join Employee C on A.FromEmployeeId = C.EmployeeId and C.IsActive = 1
join Employee D on A.ToEmployeeId = D.EmployeeId and D.IsActive = 1";
            return await connection.QueryAsync<AssetTransactionsListViewModel>(sql);
        }
    }
}
