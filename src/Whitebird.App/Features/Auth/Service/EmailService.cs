using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using Whitebird.App.Features.Auth.Interfaces;

namespace Whitebird.App.Features.Auth.Service
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName)
        {
            try
            {
                var subject = "Password Reset Request - Whitebird";
                var body = $@"
                <html>
                <body>
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #333;'>Hello {userName},</h2>
                        <p style='color: #555;'>You have requested to reset your password.</p>
                        <div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                            <p style='margin: 0; font-size: 24px; font-weight: bold; color: #007bff; text-align: center;'>
                                {resetToken}
                            </p>
                        </div>
                        <p style='color: #555;'>This code will expire in 1 hour.</p>
                        <p style='color: #777; font-size: 14px;'>
                            If you didn't request this, please ignore this email.
                        </p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                        <p style='color: #777; font-size: 12px;'>
                            Best regards,<br>
                            <strong>Whitebird Team</strong>
                        </p>
                    </div>
                </body>
                </html>";

                await SendEmailAsync(toEmail, subject, body);
                _logger.LogInformation("Password reset email sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName)
        {
            try
            {
                var subject = "Welcome to Whitebird Asset Management System!";
                var body = $@"
                <html>
                <body>
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #333;'>Welcome {userName}!</h2>
                        <p style='color: #555;'>Thank you for registering with Whitebird Asset Management System.</p>
                        <p style='color: #555;'>Your account has been successfully created and you can now:</p>
                        <ul style='color: #555;'>
                            <li>Login to the system</li>
                            <li>Manage assets and employees</li>
                            <li>Generate reports</li>
                            <li>Track asset transactions</li>
                        </ul>
                        <p style='color: #555;'>
                            If you have any questions, please contact our support team.
                        </p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                        <p style='color: #777; font-size: 12px;'>
                            Best regards,<br>
                            <strong>Whitebird Team</strong><br>
                            support@whitebird.com
                        </p>
                    </div>
                </body>
                </html>";

                await SendEmailAsync(toEmail, subject, body);
                _logger.LogInformation("Welcome email sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
                throw;
            }
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            // Ambil konfigurasi dengan default values
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = _configuration.GetValue<int>("Email:SmtpPort", 587);
            var smtpUser = _configuration["Email:SmtpUser"] ?? "your-email@gmail.com";
            var smtpPass = _configuration["Email:SmtpPass"] ?? "your-app-password";
            var fromName = _configuration["Email:FromName"] ?? "Whitebird System";
            var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();

            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}