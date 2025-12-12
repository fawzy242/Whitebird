// File: CategoryService.cs
using Mapster;
using MapsterMapper;
using Whitebird.App.Features.Category.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Category.Entities;
using Whitebird.Domain.Features.Category.View;
using Whitebird.Infra.Features.Common;

namespace Whitebird.App.Features.Category.Service
{
    public class CategoryService : ICategoryService
    {
        private readonly IGenericRepository<CategoryEntity> _repository;
        private readonly IMapper _mapper;

        public CategoryService(IGenericRepository<CategoryEntity> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<CategoryDetailViewModel>> GetByIdAsync(int id)
        {
            try
            {
                var category = await _repository.GetByIdAsync(id);
                if (category == null)
                    return Result<CategoryDetailViewModel>.Failure("Category not found");

                var viewModel = _mapper.Map<CategoryDetailViewModel>(category);
                return Result<CategoryDetailViewModel>.Success(viewModel);
            }
            catch (Exception ex)
            {
                return Result<CategoryDetailViewModel>.Failure($"Failed to get category: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<CategoryListViewModel>>> GetAllAsync()
        {
            try
            {
                var categories = await _repository.GetAllAsync();
                var viewModels = _mapper.Map<IEnumerable<CategoryListViewModel>>(categories);
                return Result<IEnumerable<CategoryListViewModel>>.Success(viewModels);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<CategoryListViewModel>>.Failure($"Failed to get categories: {ex.Message}");
            }
        }

        public async Task<Result<CategoryDetailViewModel>> CreateAsync(CategoryCreateViewModel category)
        {
            try
            {
                var entity = _mapper.Map<CategoryEntity>(category);

                // Set default values
                entity.IsActive = true;
                entity.CreatedDate = DateTime.UtcNow;
                entity.CreatedBy = "System"; // TODO: Replace with actual user from context

                var id = await _repository.InsertAsync(entity);
                var createdCategory = await _repository.GetByIdAsync(id);

                if (createdCategory == null)
                    return Result<CategoryDetailViewModel>.Failure("Failed to retrieve created category");

                var viewModel = _mapper.Map<CategoryDetailViewModel>(createdCategory);
                return Result<CategoryDetailViewModel>.Success(viewModel, "Category created successfully");
            }
            catch (Exception ex)
            {
                return Result<CategoryDetailViewModel>.Failure($"Failed to create category: {ex.Message}");
            }
        }

        public async Task<Result<CategoryDetailViewModel>> UpdateAsync(int id, CategoryUpdateViewModel category)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result<CategoryDetailViewModel>.Failure("Category not found");

                // Update properties
                _mapper.Map(category, existing);

                var affectedRows = await _repository.UpdateAsync(existing);
                if (affectedRows <= 0)
                    return Result<CategoryDetailViewModel>.Failure("Failed to update category");

                var viewModel = _mapper.Map<CategoryDetailViewModel>(existing);
                return Result<CategoryDetailViewModel>.Success(viewModel, "Category updated successfully");
            }
            catch (Exception ex)
            {
                return Result<CategoryDetailViewModel>.Failure($"Failed to update category: {ex.Message}");
            }
        }

        public async Task<Result> DeleteAsync(int id)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result.Failure("Category not found");

                // Check if category is used by assets before deletion
                // TODO: Implement CheckIfCategoryUsed method
                // var isUsed = await CheckIfCategoryUsed(id);
                // if (isUsed) return Result.Failure("Category is in use and cannot be deleted");

                var affectedRows = await _repository.DeleteAsync(id);
                return affectedRows > 0
                    ? Result.Success("Category deleted successfully")
                    : Result.Failure("Failed to delete category");
            }
            catch (Exception ex)
            {
                return Result.Failure($"Failed to delete category: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<CategoryListViewModel>>> GetActiveCategoriesAsync()
        {
            try
            {
                // TODO: Optimize dengan menambahkan method GetWhereAsync di repository
                var categories = await _repository.GetAllAsync();
                var activeCategories = categories.Where(c => c.IsActive);
                var viewModels = _mapper.Map<IEnumerable<CategoryListViewModel>>(activeCategories);
                return Result<IEnumerable<CategoryListViewModel>>.Success(viewModels);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<CategoryListViewModel>>.Failure($"Failed to get active categories: {ex.Message}");
            }
        }

        // TODO: Implement this method to check if category is used by assets
        // private async Task<bool> CheckIfCategoryUsed(int categoryId)
        // {
        //     // Query assets that use this category
        //     // Return true if any asset uses this category
        //     return false;
        // }
    }
}