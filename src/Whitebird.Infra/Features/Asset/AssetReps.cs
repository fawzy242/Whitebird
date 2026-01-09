// using System.Data;
// using Dapper;
// using Microsoft.Data.SqlClient;
// using Microsoft.Extensions.Configuration;
// using Whitebird.Domain.Features.Asset.Entities;

// namespace Whitebird.Infra.Features.Asset
// {
//     public class AssetReps
//     {
//         private readonly string _connectionString;

//         public AssetReps(IConfiguration configuration)
//         {
//             _connectionString = configuration.GetConnectionString("WhitebirdDb")
//                                  ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' is not configured.");
//         }

//         private IDbConnection CreateConnection()
//         {
//             return new SqlConnection(_connectionString);
//         }

//         public async Task<IEnumerable<AssetEntity>> GetShowData()
//         {
//             using var connection = CreateConnection();
//             string sql = "Select AssetPK, Id, Name, EntryTime as CreatedAt, UpdateTime as UpdatedAt,1 as IsActive FROM Asset";
//             return await connection.QueryAsync<AssetEntity>(sql);
//         }
//     }
// }
