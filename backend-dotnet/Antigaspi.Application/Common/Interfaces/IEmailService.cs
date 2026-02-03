
namespace Antigaspi.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendTemplateEmailAsync(string to, long templateId, Dictionary<string, string> parameters);
}
