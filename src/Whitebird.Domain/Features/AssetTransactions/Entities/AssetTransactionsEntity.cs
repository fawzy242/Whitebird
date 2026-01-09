using Whitebird.Domain.Common.Entities;
namespace Whitebird.Domain.Features.AssetTransactions.Entities
{
    public class AssetTransactionsEntity : AuditableEntity
    {
        public string Status { get; set; }
        public int TransactionId { get; set; }
        public int AssetId { get; set; }
        public int? FromEmployeeId { get; set; }
        public int? ToEmployeeId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Notes { get; set; }
    }
}