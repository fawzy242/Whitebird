// File: AssetTransactionController.cs
using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.AssetTransactions.Interfaces;
using Whitebird.App.Features.AssetTransactions.Service;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.AssetTransactions.View;
using Whitebird.Features.Common;

namespace Whitebird.App.Features.AssetTransactions.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AssetTransactionsController : ControllerBase
    {
        private readonly IAssetTransactionsService _transactionService;

        public AssetTransactionsController(IAssetTransactionsService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Result<AssetTransactionsDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _transactionService.GetByIdAsync(id);
            return this.HandleResult(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(Result<IEnumerable<AssetTransactionsListViewModel>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _transactionService.GetAllAsync();
            return this.HandleResult(result);
        }

        [HttpGet("asset/{assetId:int}")]
        [ProducesResponseType(typeof(PaginatedResult<AssetTransactionsListViewModel>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByAssetId(
            int assetId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _transactionService.GetTransactionsByAssetIdAsync(assetId, page, pageSize);
            return this.HandleResult(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Result<AssetTransactionsDetailViewModel>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] AssetTransactionsCreateViewModel transaction)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _transactionService.CreateAsync(transaction);
            return this.HandleResult(result, nameof(GetById));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(Result<AssetTransactionsDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(int id, [FromBody] AssetTransactionsUpdateViewModel transaction)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _transactionService.UpdateAsync(id, transaction);
            return this.HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _transactionService.DeleteAsync(id);
            return this.HandleResult(result);
        }
    }
}