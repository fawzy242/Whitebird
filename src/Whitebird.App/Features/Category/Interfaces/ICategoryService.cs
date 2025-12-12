// File: ICategoryService.cs
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Category.View;

namespace Whitebird.App.Features.Category.Interfaces
{
    public interface ICategoryService
    {
        Task<Result<CategoryDetailViewModel>> GetByIdAsync(int id);
        Task<Result<IEnumerable<CategoryListViewModel>>> GetAllAsync();
        Task<Result<CategoryDetailViewModel>> CreateAsync(CategoryCreateViewModel category);
        Task<Result<CategoryDetailViewModel>> UpdateAsync(int id, CategoryUpdateViewModel category);
        Task<Result> DeleteAsync(int id);
        Task<Result<IEnumerable<CategoryListViewModel>>> GetActiveCategoriesAsync();
    }
}