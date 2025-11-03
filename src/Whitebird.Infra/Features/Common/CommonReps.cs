using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Whitebird.Infra.Features.Common
{
    public static class CommonReps
    {
        public static void BuildInsertQuery<T>(T entity, string connectionString)
        {
            using (var connection = new SqlConnection(connectionString))
            {
                var tableName = typeof(T).Name;
                var properties = typeof(T).GetProperties();

                var columnNames = string.Join(", ", properties.Select(p => p.Name));
                var parameterNames = string.Join(", ", properties.Select(p => $"@{p.Name}"));

                var query = $"INSERT INTO {tableName} ({columnNames}) VALUES ({parameterNames});";

                connection.Execute(query, entity);
            }
        }

        public static void BuildUpdateQuery<T>(T entity, string keyColumn, string connectionString)
        {
            using (var connection = new SqlConnection(connectionString))
            {
                var tableName = typeof(T).Name;
                var properties = typeof(T).GetProperties();

                var setClause = string.Join(", ", properties.Select(p => $"{p.Name} = @{p.Name}"));
                var query = $"UPDATE {tableName} SET {setClause} WHERE {keyColumn} = @{keyColumn};";

                connection.Execute(query, entity);
            }
        }

        public static void BuildDeleteQuery<T>(string keyColumn, object keyValue, string connectionString)
        {
            using (var connection = new SqlConnection(connectionString))
            {
                var tableName = typeof(T).Name;
                var query = $"DELETE FROM {tableName} WHERE {keyColumn} = @{keyColumn};";

                connection.Execute(query, new { keyColumn = keyValue });
            }
        }

        public static void BuildSelectQuery<T>(string connectionString, Action<IEnumerable<T>> handleData)
        {
            using (var connection = new SqlConnection(connectionString))
            {
                var tableName = typeof(T).Name;
                var properties = typeof(T).GetProperties();

                var columnNames = string.Join(", ", properties.Select(p => p.Name));
                var query = $"SELECT {columnNames} FROM {tableName};";

                var result = connection.Query<T>(query);
                handleData(result);
            }
        }
    }
}
