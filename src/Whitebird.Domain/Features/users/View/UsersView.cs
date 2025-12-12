namespace Whitebird.Domain.Features.Users.View
{
    public class UsersViewModel
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;

        // PasswordHash & Salt tidak ditampilkan ke ViewModel demi keamanan.
        // Biasanya hanya digunakan di Entity / Service.

        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // Audit (ditampilkan hanya jika perlu)
        // public DateTime CreatedAt { get; set; }
        // public DateTime? UpdatedAt { get; set; }
        // public int CreatedBy { get; set; }
        // public int? UpdatedBy { get; set; }
    }
}