using Antigaspi.Domain.Enums;

namespace Antigaspi.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }

    // Constructor for EF Core / Persistence
    private User() { }

    public User(string email, string passwordHash, UserRole role, Guid? id = null, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("User email is required");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("User password hash is required");

        Id = id ?? Guid.NewGuid();
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        IsActive = isActive;
    }

    public static User Create(string email, string passwordHash, UserRole role)
    {
        return new User(email, passwordHash, role);
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash)) throw new ArgumentException("New password hash is required");
        PasswordHash = newPasswordHash;
    }
}
