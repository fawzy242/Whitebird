using Whitebird.Domain.Common.Entities;
namespace Whitebird.Domain.Features.Users.Entities
{
    public class UsersEntity : AuditableEntity
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? RoleId { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }

        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }
    }
}