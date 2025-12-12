// File: AssetTransactionservice.cs
using Mapster;
using MapsterMapper;
using Whitebird.App.Features.AssetTransactions.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.AssetTransactions.Entities;
using Whitebird.Domain.Features.AssetTransactions.View;
using Whitebird.Infra.Features.Common;

namespace Whitebird.App.Features.AssetTransactions.Service
{
    public class AssetTransactionsService : IAssetTransactionsService
    {
        private readonly IGenericRepository<AssetTransactionsEntity> _repository;
        private readonly IMapper _mapper;

        public AssetTransactionsService(IGenericRepository<AssetTransactionsEntity> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<AssetTransactionsDetailViewModel>> GetByIdAsync(int id)
        {
            try
            {
                var transaction = await _repository.GetByIdAsync(id);
                if (transaction == null)
                    return Result<AssetTransactionsDetailViewModel>.Failure("Transaction not found");

                var viewModel = _mapper.Map<AssetTransactionsDetailViewModel>(transaction);
                return Result<AssetTransactionsDetailViewModel>.Success(viewModel);
            }
            catch (Exception ex)
            {
                return Result<AssetTransactionsDetailViewModel>.Failure($"Failed to get transaction: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<AssetTransactionsListViewModel>>> GetAllAsync()
        {
            try
            {
                var transactions = await _repository.GetAllAsync();
                var viewModels = transactions.Select(t => _mapper.Map<AssetTransactionsListViewModel>(t));
                return Result<IEnumerable<AssetTransactionsListViewModel>>.Success(viewModels);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<AssetTransactionsListViewModel>>.Failure($"Failed to get transactions: {ex.Message}");
            }
        }

        public async Task<Result<AssetTransactionsDetailViewModel>> CreateAsync(AssetTransactionsCreateViewModel transaction)
        {
            try
            {
                var entity = _mapper.Map<AssetTransactionsEntity>(transaction);

                // Set transaction date if not provided
                if (entity.TransactionDate == default)
                    entity.TransactionDate = DateTime.UtcNow;

                // Set audit fields
                entity.CreatedDate = DateTime.UtcNow;
                entity.CreatedBy = "System"; // TODO: Replace with actual user from context

                var id = await _repository.InsertAsync(entity);
                var createdTransaction = await _repository.GetByIdAsync(id);

                if (createdTransaction == null)
                    return Result<AssetTransactionsDetailViewModel>.Failure("Failed to retrieve created transaction");

                var viewModel = _mapper.Map<AssetTransactionsDetailViewModel>(createdTransaction);
                return Result<AssetTransactionsDetailViewModel>.Success(viewModel, "Transaction created successfully");
            }
            catch (Exception ex)
            {
                return Result<AssetTransactionsDetailViewModel>.Failure($"Failed to create transaction: {ex.Message}");
            }
        }

        public async Task<Result<AssetTransactionsDetailViewModel>> UpdateAsync(int id, AssetTransactionsUpdateViewModel transaction)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result<AssetTransactionsDetailViewModel>.Failure("Transaction not found");

                // Update properties
                _mapper.Map(transaction, existing);

                var affectedRows = await _repository.UpdateAsync(existing);
                if (affectedRows <= 0)
                    return Result<AssetTransactionsDetailViewModel>.Failure("Failed to update transaction");

                var viewModel = _mapper.Map<AssetTransactionsDetailViewModel>(existing);
                return Result<AssetTransactionsDetailViewModel>.Success(viewModel, "Transaction updated successfully");
            }
            catch (Exception ex)
            {
                return Result<AssetTransactionsDetailViewModel>.Failure($"Failed to update transaction: {ex.Message}");
            }
        }

        public async Task<Result> DeleteAsync(int id)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result.Failure("Transaction not found");

                var affectedRows = await _repository.DeleteAsync(id);
                return affectedRows > 0
                    ? Result.Success("Transaction deleted successfully")
                    : Result.Failure("Failed to delete transaction");
            }
            catch (Exception ex)
            {
                return Result.Failure($"Failed to delete transaction: {ex.Message}");
            }
        }

        public async Task<PaginatedResult<AssetTransactionsListViewModel>> GetTransactionsByAssetIdAsync(int assetId, int page, int pageSize)
        {
            try
            {
                // Option 1: If your repository doesn't support ExecuteScalarAsync, do it manually
                var sql = @"
                    SELECT * FROM AssetTransactions 
                    WHERE AssetId = @AssetId 
                    ORDER BY TransactionDate DESC";

                var parameters = new { AssetId = assetId };

                var allTransactions = await _repository.QueryAsync(sql, parameters);
                var totalCount = allTransactions.Count();

                var pagedTransactions = allTransactions
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var viewModels = pagedTransactions.Select(t => _mapper.Map<AssetTransactionsListViewModel>(t));
                return PaginatedResult<AssetTransactionsListViewModel>.Success(viewModels, totalCount, page, pageSize);
            }
            catch (Exception ex)
            {
                return PaginatedResult<AssetTransactionsListViewModel>.Failure($"Failed to get transactions by asset ID: {ex.Message}");
            }
        }
    }
}