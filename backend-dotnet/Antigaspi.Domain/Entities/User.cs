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
    public bool IsEmailVerified { get; private set; }
    public string? OtpCode { get; private set; }
    public DateTime? OtpExpiration { get; private set; }
    public bool IsActive { get; private set; }
    public int VerificationEmailCount { get; private set; }
    public DateTime? LastVerificationEmailSentAt { get; private set; }
    public string PreferredLanguage { get; private set; } // 'fr', 'en', 'ar'

    // Constructor for EF Core / Persistence
    private User() { }

    public User(string firstName, string lastName, string email, string passwordHash, UserRole role, string preferredLanguage = "fr", Guid? id = null, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("User email is required");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("User password hash is required");

        Id = id ?? Guid.NewGuid();
        FirstName = firstName ?? string.Empty;
        LastName = lastName ?? string.Empty;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        PreferredLanguage = preferredLanguage;
        IsActive = isActive;
        IsEmailVerified = false; // Default false
    }

    public static User Create(string firstName, string lastName, string email, string passwordHash, UserRole role, string preferredLanguage = "fr")
    {
        return new User(firstName, lastName, email, passwordHash, role, preferredLanguage);
    }

    public void UpdatePreferredLanguage(string language)
    {
        if (!string.IsNullOrWhiteSpace(language))
        {
            PreferredLanguage = language.ToLower();
        }
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash)) throw new ArgumentException("New password hash is required");
        PasswordHash = newPasswordHash;
    }

    public void SetOtp(string otpCode, int expirationMinutes = 15)
    {
        OtpCode = otpCode;
        OtpExpiration = DateTime.UtcNow.AddMinutes(expirationMinutes);
    }

    public bool VerifyOtp(string otpCode)
    {
        if (string.IsNullOrEmpty(OtpCode) || OtpExpiration == null) return false;
        if (DateTime.UtcNow > OtpExpiration) return false;
        if (OtpCode != otpCode) return false;

        IsEmailVerified = true;
        OtpCode = null; // Clear OTP after success
        OtpExpiration = null;
        return true;
    }

    public void MarkEmailVerified()
    {
        IsEmailVerified = true;
        OtpCode = null;
        OtpExpiration = null;
        VerificationEmailCount = 0; // Reset on success
        LastVerificationEmailSentAt = null;
    }

    public bool CanSendVerificationEmail(int maxAttempts = 3, int lockoutHours = 24)
    {
        if (IsEmailVerified) return false;

        // If never sent or sent long ago (outside lockout window), allowed
        if (!LastVerificationEmailSentAt.HasValue) return true;
        
        // If window passed, reset happens in Increment, but here we just say 'yes you can start new window'
        if (DateTime.UtcNow > LastVerificationEmailSentAt.Value.AddHours(lockoutHours)) return true;

        // Within window, check count
        return VerificationEmailCount < maxAttempts;
    }

    public void IncrementVerificationEmailCount(int lockoutHours = 24)
    {
        // If first time or window expired, reset
        if (!LastVerificationEmailSentAt.HasValue || DateTime.UtcNow > LastVerificationEmailSentAt.Value.AddHours(lockoutHours))
        {
            VerificationEmailCount = 1;
        }
        else
        {
            VerificationEmailCount++;
        }
        LastVerificationEmailSentAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Activate()
    {
        IsActive = true;
    }
}
