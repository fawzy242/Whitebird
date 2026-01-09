using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Whitebird.Domain.Features.Asset.View;

namespace Whitebird.Infra.Features.Asset
{
    public class AssetReps : IAssetReps
    {
        private readonly string _connectionString;

        public AssetReps(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WhitebirdDb")
                                 ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

                public async Task<AssetDetailViewModel> GetByIdAsync(int assetId)
        {
            using var connection = CreateConnection();
            string sql = $@"select B.CategoryName,A.* from Asset A
join Category B on A.CategoryId = B.CategoryId and B.IsActive = 1
where A.AssetId = @AssetId";
            var param = new { AssetId = assetId };
            return await connection.QueryFirstOrDefaultAsync<AssetDetailViewModel>(sql, param);
        }

        public async Task<IEnumerable<AssetDetailViewModel>> GetAllAsync()
        {
            using var connection = CreateConnection();
            string sql = $@"select B.CategoryName,A.* from Asset A
join Category B on A.CategoryId = B.CategoryId and B.IsActive = 1";
            return await connection.QueryAsync<AssetDetailViewModel>(sql);
        }
    }
}
