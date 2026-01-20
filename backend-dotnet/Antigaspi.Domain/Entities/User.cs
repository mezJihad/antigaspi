using Antigaspi.Domain.Enums;

namespace Antigaspi.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }

    // Constructor for EF Core / Persistence
    private User() { }

    public User(string firstName, string lastName, string email, string passwordHash, UserRole role, Guid? id = null, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("User email is required");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("User password hash is required");

        Id = id ?? Guid.NewGuid();
        FirstName = firstName ?? string.Empty;
        LastName = lastName ?? string.Empty;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        IsActive = isActive;
    }

    public static User Create(string firstName, string lastName, string email, string passwordHash, UserRole role)
    {
        return new User(firstName, lastName, email, passwordHash, role);
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash)) throw new ArgumentException("New password hash is required");
        PasswordHash = newPasswordHash;
    }
}
