// File: AssetService.cs
using Mapster;
using MapsterMapper;
using Whitebird.App.Features.Asset.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Asset.Entities;
using Whitebird.Domain.Features.Asset.View;
using Whitebird.Infra.Features.Asset;
using Whitebird.Infra.Features.Common;

namespace Whitebird.App.Features.Asset.Service
{
    public class AssetService : IAssetService
    {
        private readonly IGenericRepository<AssetEntity> _repository;
        private readonly IAssetReps _assetReps;
        private readonly IMapper _mapper;

        public AssetService(IGenericRepository<AssetEntity> repository, IAssetReps assetReps, IMapper mapper)
        {
            _repository = repository;
            _assetReps = assetReps;
            _mapper = mapper;
        }

        public async Task<Result<AssetDetailViewModel>> GetByIdAsync(int id)
        {
            try
            {
                var asset = await _assetReps.GetByIdAsync(id);
                if (asset == null || !asset.IsActive)
                    return Result<AssetDetailViewModel>.Failure("Asset not found or inactive");

                var viewModel = _mapper.Map<AssetDetailViewModel>(asset);
                return Result<AssetDetailViewModel>.Success(viewModel);
            }
            catch (Exception ex)
            {
                return Result<AssetDetailViewModel>.Failure($"Failed to get asset: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<AssetListViewModel>>> GetAllAsync()
        {
            try
            {
                var assets = await _assetReps.GetAllAsync();
                var activeAssets = assets.Where(a => a.IsActive);
                var viewModels = _mapper.Map<IEnumerable<AssetListViewModel>>(activeAssets);
                return Result<IEnumerable<AssetListViewModel>>.Success(viewModels);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<AssetListViewModel>>.Failure($"Failed to get assets: {ex.Message}");
            }
        }

        public async Task<Result<AssetDetailViewModel>> CreateAsync(AssetCreateViewModel asset)
        {
            try
            {
                var entity = _mapper.Map<AssetEntity>(asset);

                // Generate AssetCode if not provided
                if (string.IsNullOrEmpty(entity.AssetCode))
                {
                    entity.AssetCode = GenerateAssetCode();
                }

                // Set default values
                entity.Status = "Available";
                entity.IsActive = true;
                entity.CreatedDate = DateTime.UtcNow;
                entity.CreatedBy = "System"; // TODO: Replace with actual user from context

                var id = await _repository.InsertAsync(entity);
                var createdAsset = await _repository.GetByIdAsync(id);

                if (createdAsset == null)
                    return Result<AssetDetailViewModel>.Failure("Failed to retrieve created asset");

                var viewModel = _mapper.Map<AssetDetailViewModel>(createdAsset);
                return Result<AssetDetailViewModel>.Success(viewModel, "Asset created successfully");
            }
            catch (Exception ex)
            {
                return Result<AssetDetailViewModel>.Failure($"Failed to create asset: {ex.Message}");
            }
        }

        public async Task<Result<AssetDetailViewModel>> UpdateAsync(int id, AssetUpdateViewModel asset)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result<AssetDetailViewModel>.Failure("Asset not found");

                // Update properties
                _mapper.Map(asset, existing);

                var affectedRows = await _repository.UpdateAsync(existing);
                if (affectedRows <= 0)
                    return Result<AssetDetailViewModel>.Failure("Failed to update asset");

                var viewModel = _mapper.Map<AssetDetailViewModel>(existing);
                return Result<AssetDetailViewModel>.Success(viewModel, "Asset updated successfully");
            }
            catch (Exception ex)
            {
                return Result<AssetDetailViewModel>.Failure($"Failed to update asset: {ex.Message}");
            }
        }

        public async Task<Result> DeleteAsync(int id)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result.Failure("Asset not found");

                // Soft delete
                existing.IsActive = false;
                await _repository.UpdateAsync(existing);

                return Result.Success("Asset deleted successfully");
            }
            catch (Exception ex)
            {
                return Result.Failure($"Failed to delete asset: {ex.Message}");
            }
        }

        public async Task<PaginatedResult<AssetListViewModel>> GetGridDataAsync(int page, int pageSize, string? search = null)
        {
            try
            {
                var assets = await _assetReps.GetAllAsync();

                // Filter active assets
                var query = assets.Where(a => a.IsActive);

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(a =>
                        a.AssetName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        a.AssetCode.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        (a.SerialNumber != null && a.SerialNumber.Contains(search, StringComparison.OrdinalIgnoreCase))
                    );
                }

                var totalCount = query.Count();
                var pagedData = query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var viewModels = _mapper.Map<IEnumerable<AssetListViewModel>>(pagedData);
                return PaginatedResult<AssetListViewModel>.Success(viewModels, totalCount, page, pageSize);
            }
            catch (Exception ex)
            {
                return PaginatedResult<AssetListViewModel>.Failure($"Failed to get grid data: {ex.Message}");
            }
        }

        private string GenerateAssetCode()
        {
            return $"AST-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        }
    }
}