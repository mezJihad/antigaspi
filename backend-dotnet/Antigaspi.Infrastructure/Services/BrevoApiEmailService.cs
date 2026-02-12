using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Antigaspi.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Antigaspi.Infrastructure.Services;

public class BrevoApiEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<BrevoApiEmailService> _logger;

    public BrevoApiEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<BrevoApiEmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var apiKey = _configuration["Brevo:ApiKey"];
        var senderEmail = _configuration["Brevo:SenderEmail"];
        var senderName = _configuration["Brevo:SenderName"] ?? "NoGaspi";
        var replyToEmail = _configuration["Brevo:ReplyToEmail"];
        var replyToName = _configuration["Brevo:ReplyToName"];

        if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(senderEmail))
        {
            _logger.LogWarning("Brevo API Key or Sender Email is missing. Email to {To} was not sent via API.", to);
            return;
        }

        var request = new BrevoSendEmailRequest
        {
            Sender = new BrevoEmailContact { Email = senderEmail, Name = senderName },
            To = new List<BrevoEmailContact> { new BrevoEmailContact { Email = to } },
            Subject = subject,
            HtmlContent = body
        };

        if (!string.IsNullOrEmpty(replyToEmail))
        {
            request.ReplyTo = new BrevoEmailContact { Email = replyToEmail, Name = replyToName };
        }

        _httpClient.DefaultRequestHeaders.Remove("api-key");
        _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);

        try
        {
            var response = await _httpClient.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", request);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully to {To} via Brevo API.", to);
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to send email to {To}. Status: {Status}. Error: {Error}", to, response.StatusCode, errorContent);
                throw new Exception($"Brevo API Error: {response.StatusCode} - {errorContent}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while sending email to {To} via Brevo API.", to);
            throw;
        }
    }

    public async Task SendTemplateEmailAsync(string to, long templateId, Dictionary<string, string> parameters)
    {
        var apiKey = _configuration["Brevo:ApiKey"];
        var replyToEmail = _configuration["Brevo:ReplyToEmail"];
        var replyToName = _configuration["Brevo:ReplyToName"];
        
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Brevo API Key is missing. Template Email to {To} was not sent via API.", to);
            return;
        }

        var request = new BrevoSendTemplateEmailRequest
        {
            To = new List<BrevoEmailContact> { new BrevoEmailContact { Email = to } },
            TemplateId = templateId,
            Params = parameters
        };

        if (!string.IsNullOrEmpty(replyToEmail))
        {
            request.ReplyTo = new BrevoEmailContact { Email = replyToEmail, Name = replyToName };
        }

        _httpClient.DefaultRequestHeaders.Remove("api-key");
        _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);

        try
        {
            var response = await _httpClient.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", request);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Template Email {TemplateId} sent successfully to {To} via Brevo API.", templateId, to);
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to send template email to {To}. Status: {Status}. Error: {Error}", to, response.StatusCode, errorContent);
                throw new Exception($"Brevo API Error: {response.StatusCode} - {errorContent}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while sending template email to {To} via Brevo API.", to);
            throw;
        }
    }

    private class BrevoSendEmailRequest
    {
        [JsonPropertyName("sender")]
        public BrevoEmailContact Sender { get; set; }

        [JsonPropertyName("to")]
        public List<BrevoEmailContact> To { get; set; }

        [JsonPropertyName("replyTo")]
        public BrevoEmailContact ReplyTo { get; set; }

        [JsonPropertyName("subject")]
        public string Subject { get; set; }

        [JsonPropertyName("htmlContent")]
        public string HtmlContent { get; set; }
    }

    private class BrevoSendTemplateEmailRequest
    {
        [JsonPropertyName("to")]
        public List<BrevoEmailContact> To { get; set; }

        [JsonPropertyName("replyTo")]
        public BrevoEmailContact ReplyTo { get; set; }

        [JsonPropertyName("templateId")]
        public long TemplateId { get; set; }

        [JsonPropertyName("params")]
        public Dictionary<string, string> Params { get; set; }
    }

    private class BrevoEmailContact
    {
        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }
    }
}
