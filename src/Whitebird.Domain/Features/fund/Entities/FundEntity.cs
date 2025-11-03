namespace Whitebird.Domain.Features.fund.Entities
{
    public class FundEntity
    {
        public int FundPK { get; set; }
        public string? Id { get; set; }
        public string? Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class FundGrid
    {
        public int FundPK { get; set; }
        public string? Id { get; set; }
        public string? Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }
    
}