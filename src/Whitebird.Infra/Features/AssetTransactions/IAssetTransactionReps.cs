// File: IReportsReps.cs

// File: IReportsReps.cs
using Whitebird.Domain.Features.AssetTransactions.View;

namespace Whitebird.Infra.Features.AssetTransactions
{
    public interface IAssetTransactionsReps
    {
        Task<AssetTransactionsListViewModel> GetByIdAsync(int assetTransactionsId);
        Task<IEnumerable<AssetTransactionsListViewModel>> GetAllAsync();
    }
}