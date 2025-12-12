using System.Data;

namespace Whitebird.Infra.Features.Common
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(object id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<object> InsertAsync(T entity);
        Task<int> UpdateAsync(T entity);
        Task<int> DeleteAsync(object id);
        Task<IEnumerable<T>> QueryAsync(string sql, object? parameters = null);
    }
}