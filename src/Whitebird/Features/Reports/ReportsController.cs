// File: ReportsController.cs
using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Reports.Interfaces;
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Reports.View;
using Whitebird.Features.Common;

namespace Whitebird.App.Features.Reports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsService _reportService;

        public ReportsController(IReportsService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("data")]
        [ProducesResponseType(typeof(Result<IEnumerable<ReportsAssetTransactionViewModel>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetReportData()
        {
            var result = await _reportService.GetReportDataAsync();
            return this.HandleResult(result);
        }

        [HttpGet("excel")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GenerateExcelReport()
        {
            var result = await _reportService.GenerateExcelReportAsync();

            if (!result.IsSuccess)
            {
                return BadRequest(new { message = result.Message });
            }

            // Generate filename with timestamp
            var fileName = $"Asset_Transaction_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            // Return Excel file as BLOB
            return File(
                result.Data,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }

        [HttpGet("excel/download")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DownloadExcelReport()
        {
            // This is an alias for the GenerateExcelReport endpoint
            return await GenerateExcelReport();
        }
    }
}