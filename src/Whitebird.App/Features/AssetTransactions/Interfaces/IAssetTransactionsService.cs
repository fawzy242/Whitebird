// File: IAssetTransactionService.cs
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.AssetTransactions.View;

namespace Whitebird.App.Features.AssetTransactions.Interfaces
{
    public interface IAssetTransactionsService
    {
        Task<Result<AssetTransactionsDetailViewModel>> GetByIdAsync(int id);
        Task<Result<IEnumerable<AssetTransactionsListViewModel>>> GetAllAsync();
        Task<Result<AssetTransactionsDetailViewModel>> CreateAsync(AssetTransactionsCreateViewModel transaction);
        Task<Result<AssetTransactionsDetailViewModel>> UpdateAsync(int id, AssetTransactionsUpdateViewModel transaction);
        Task<Result> DeleteAsync(int id);
        Task<PaginatedResult<AssetTransactionsListViewModel>> GetTransactionsByAssetIdAsync(int assetId, int page, int pageSize);
    }
}