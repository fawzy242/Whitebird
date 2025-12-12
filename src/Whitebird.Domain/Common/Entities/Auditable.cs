namespace Whitebird.Domain.Common.Entities
{
    public class AuditableEntity
    {
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}