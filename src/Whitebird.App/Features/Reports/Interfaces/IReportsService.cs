// File: IReportsService.cs
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Reports.View;

namespace Whitebird.App.Features.Reports.Interfaces
{
    public interface IReportsService
    {
        Task<Result<byte[]>> GenerateExcelReportAsync();
        Task<Result<IEnumerable<ReportsAssetTransactionViewModel>>> GetReportDataAsync();
    }
}