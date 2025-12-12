// File: AssetController.cs
using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Asset.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Asset.View;
using Whitebird.Features.Common;

namespace Whitebird.App.Features.Asset.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AssetController : ControllerBase
    {
        private readonly IAssetService _assetService;

        public AssetController(IAssetService assetService)
        {
            _assetService = assetService;
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Result<AssetDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _assetService.GetByIdAsync(id);
            return this.HandleResult(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(Result<IEnumerable<AssetListViewModel>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _assetService.GetAllAsync();
            return this.HandleResult(result);
        }

        [HttpGet("grid")]
        [ProducesResponseType(typeof(PaginatedResult<AssetListViewModel>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetGridData(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _assetService.GetGridDataAsync(page, pageSize, search);
            return this.HandleResult(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Result<AssetDetailViewModel>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] AssetCreateViewModel asset)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _assetService.CreateAsync(asset);
            return this.HandleResult(result, nameof(GetById));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(Result<AssetDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(int id, [FromBody] AssetUpdateViewModel asset)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _assetService.UpdateAsync(id, asset);
            return this.HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _assetService.DeleteAsync(id);
            return this.HandleResult(result);
        }
    }
}