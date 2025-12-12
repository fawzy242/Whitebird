// File: IAssetService.cs
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Asset.Entities;
using Whitebird.Domain.Features.Asset.View;

namespace Whitebird.App.Features.Asset.Interfaces
{
    public interface IAssetService
    {
        Task<Result<AssetDetailViewModel>> GetByIdAsync(int id);
        Task<Result<IEnumerable<AssetListViewModel>>> GetAllAsync();
        Task<Result<AssetDetailViewModel>> CreateAsync(AssetCreateViewModel asset);
        Task<Result<AssetDetailViewModel>> UpdateAsync(int id, AssetUpdateViewModel asset);
        Task<Result> DeleteAsync(int id);
        Task<PaginatedResult<AssetListViewModel>> GetGridDataAsync(int page, int pageSize, string? search = null);
    }
}