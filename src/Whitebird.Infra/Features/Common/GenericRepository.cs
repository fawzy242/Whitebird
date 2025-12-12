using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Whitebird.Infra.Features.Common
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly string _connectionString;
        private readonly ILogger<GenericRepository<T>> _logger;

        public GenericRepository(IConfiguration configuration, ILogger<GenericRepository<T>> logger)
        {
            _connectionString = configuration.GetConnectionString("WhitebirdDb") 
                                 ?? throw new InvalidOperationException("Connection string 'WhitebirdDb' not found.");
            _logger = logger;
        }

        private string GetTableName()
        {
            var typeName = typeof(T).Name;
            return typeName.EndsWith("Entity", StringComparison.OrdinalIgnoreCase)
                ? typeName[..^6]
                : typeName;
        }

        private string GetPrimaryKeyName()
        {
            var tableName = GetTableName();
            var pkName = $"{tableName}Id";

            // Check if property exists
            var pkProperty = typeof(T).GetProperty(pkName) ??
                           typeof(T).GetProperty("Id") ??
                           typeof(T).GetProperty("ID");

            return pkProperty?.Name ?? throw new InvalidOperationException("Primary key not found");
        }

        public async Task<T?> GetByIdAsync(object id)
        {
            using var connection = new SqlConnection(_connectionString);

            var tableName = GetTableName();
            var pkName = GetPrimaryKeyName();

            var query = $"SELECT * FROM {tableName} WHERE {pkName} = @id";

            try
            {
                return await connection.QueryFirstOrDefaultAsync<T>(query, new { id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting {Type} by id {Id}", typeof(T).Name, id);
                throw;
            }
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            using var connection = new SqlConnection(_connectionString);

            var tableName = GetTableName();
            var query = $"SELECT * FROM {tableName}";

            try
            {
                return await connection.QueryAsync<T>(query);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all {Type}", typeof(T).Name);
                throw;
            }
        }

        public async Task<object> InsertAsync(T entity)
        {
            using var connection = new SqlConnection(_connectionString);

            var tableName = GetTableName();
            var pkName = GetPrimaryKeyName();

            // Exclude primary key if auto-increment
            var properties = typeof(T).GetProperties()
                .Where(p => !p.PropertyType.IsClass || p.PropertyType == typeof(string))
                .Where(p => !p.Name.Equals(pkName, StringComparison.OrdinalIgnoreCase));

            var columns = string.Join(", ", properties.Select(p => p.Name));
            var values = string.Join(", ", properties.Select(p => $"@{p.Name}"));

            var query = $"INSERT INTO {tableName} ({columns}) VALUES ({values}); SELECT SCOPE_IDENTITY();";

            try
            {
                var newId = await connection.ExecuteScalarAsync<object>(query, entity);

                // Set ID back to entity
                var idProperty = typeof(T).GetProperty(pkName);
                if (idProperty != null && newId != null)
                {
                    idProperty.SetValue(entity, Convert.ChangeType(newId, idProperty.PropertyType));
                }

                return newId ?? throw new InvalidOperationException("Insert operation did not return a valid ID.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inserting {Type}", typeof(T).Name);
                throw;
            }
        }

        public async Task<int> UpdateAsync(T entity)
        {
            using var connection = new SqlConnection(_connectionString);

            var tableName = GetTableName();
            var pkName = GetPrimaryKeyName();

            var properties = typeof(T).GetProperties()
                .Where(p => !p.PropertyType.IsClass || p.PropertyType == typeof(string))
                .Where(p => !p.Name.Equals(pkName, StringComparison.OrdinalIgnoreCase));

            var setClause = string.Join(", ", properties.Select(p => $"{p.Name} = @{p.Name}"));
            var query = $"UPDATE {tableName} SET {setClause} WHERE {pkName} = @{pkName}";

            try
            {
                return await connection.ExecuteAsync(query, entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating {Type}", typeof(T).Name);
                throw;
            }
        }

        public async Task<int> DeleteAsync(object id)
        {
            using var connection = new SqlConnection(_connectionString);

            var tableName = GetTableName();
            var pkName = GetPrimaryKeyName();
            var query = $"DELETE FROM {tableName} WHERE {pkName} = @id";

            try
            {
                return await connection.ExecuteAsync(query, new { id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting {Type} with id {Id}", typeof(T).Name, id);
                throw;
            }
        }

        public async Task<IEnumerable<T>> QueryAsync(string sql, object? parameters = null)
        {
            using var connection = new SqlConnection(_connectionString);

            try
            {
                return await connection.QueryAsync<T>(sql, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing query: {Sql}", sql);
                throw;
            }
        }
    }
}