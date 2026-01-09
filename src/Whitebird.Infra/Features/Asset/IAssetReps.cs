using Whitebird.Domain.Features.Asset.View;

namespace Whitebird.Infra.Features.Asset
{
    public interface IAssetReps
    {
        Task<AssetDetailViewModel> GetByIdAsync(int assetId);
        Task<IEnumerable<AssetDetailViewModel>> GetAllAsync();
    }
}