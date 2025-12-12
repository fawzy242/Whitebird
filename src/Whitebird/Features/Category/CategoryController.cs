// File: CategoryController.cs
using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Category.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Category.View;
using Whitebird.Features.Common;

namespace Whitebird.App.Features.Category.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Result<CategoryDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _categoryService.GetByIdAsync(id);
            return this.HandleResult(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(Result<IEnumerable<CategoryListViewModel>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _categoryService.GetAllAsync();
            return this.HandleResult(result);
        }

        [HttpGet("active")]
        [ProducesResponseType(typeof(Result<IEnumerable<CategoryListViewModel>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActiveCategories()
        {
            var result = await _categoryService.GetActiveCategoriesAsync();
            return this.HandleResult(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Result<CategoryDetailViewModel>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CategoryCreateViewModel category)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _categoryService.CreateAsync(category);
            return this.HandleResult(result, nameof(GetById));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(Result<CategoryDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryUpdateViewModel category)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _categoryService.UpdateAsync(id, category);
            return this.HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _categoryService.DeleteAsync(id);
            return this.HandleResult(result);
        }
    }
}