// File: ReportsReps.cs
using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Whitebird.Domain.Features.Reports.View;

namespace Whitebird.Infra.Features.Reports
{
    public class ReportsReps : IReportsReps
    {
        private readonly string _connectionString;

        public ReportsReps(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WhitebirdDb")
                                 ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<IEnumerable<ReportsAssetTransactionViewModel>> GetAssetTransactionReportsAsync()
        {
            using var connection = CreateConnection();

            var sql = @"
                SELECT 
                    C.EmployeeCode,
                    C.FullName,
                    C.Email,
                    D.CategoryName,
                    B.CategoryId,
                    B.AssetName,
                    B.AssetCode,
                    B.SerialNumber,
                    B.Condition,
                    B.PurchaseDate,
                    A.TransactionDate,
                    B.PurchasePrice,
                    A.Notes 
                FROM AssetTransactions A
                LEFT JOIN Asset B ON A.AssetId = B.AssetId AND B.IsActive = 1
                LEFT JOIN Employee C ON A.ToEmployeeId = C.EmployeeId AND C.IsActive = 1
                LEFT JOIN Category D ON B.CategoryId = D.CategoryId AND D.IsActive = 1
                ORDER BY A.TransactionDate, C.EmployeeId, D.CategoryId, B.AssetId";

            return await connection.QueryAsync<ReportsAssetTransactionViewModel>(sql);
        }
    }
}