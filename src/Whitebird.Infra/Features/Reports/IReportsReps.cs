// File: IReportsReps.cs
using Whitebird.Domain.Features.Reports.View;

namespace Whitebird.Infra.Features.Reports
{
    public interface IReportsReps
    {
        Task<IEnumerable<ReportsAssetTransactionViewModel>> GetAssetTransactionReportsAsync();
    }
}