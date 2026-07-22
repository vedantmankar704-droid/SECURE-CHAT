require('dotenv').config();
const nodemailer = require('nodemailer');

const emailService = (process.env.EMAIL_SERVICE || '').trim();
const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').trim();

// Log credentials securely (password only printed as length)
console.log('✉️  Nodemailer Email Service Startup Configuration:');
console.log(`   - EMAIL_SERVICE: "${emailService}"`);
console.log(`   - EMAIL_USER: "${emailUser}"`);
console.log(`   - EMAIL_PASS (Length): ${emailPass.length}`);

// Validate that Gmail SMTP environment variables exist
if (!emailService || !emailUser || !emailPass) {
  console.error('\n==================================================================');
  console.error('❌ CRITICAL ERROR: Nodemailer SMTP configuration is missing in .env');
  console.error('Please configure the following environment variables in BACKEND/.env:');
  console.error('  EMAIL_SERVICE=Gmail');
  console.error('  EMAIL_USER=your_gmail@gmail.com');
  console.error('  EMAIL_PASS=your_16_character_google_app_password');
  console.error('==================================================================\n');
  process.exit(1);
}

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: emailService.toLowerCase() === 'gmail' ? 'gmail' : emailService,
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Test SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail SMTP Connection/Authentication Failed:', error.message);
  } else {
    console.log('✅ Gmail SMTP Server is successfully verified and ready to deliver emails');
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Secure Chat Support" <${emailUser}>`,
    to: email,
    subject: '🔒 Secure Chat - Password Reset OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #E2E8F0; overflow: hidden; padding: 40px 32px;">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #EFF6FF; border-radius: 14px; padding: 12px;">
                      <tr>
                        <td align="center" style="font-size: 28px; line-height: 1;">
                          🔒
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td align="center" style="font-size: 13px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 8px;">
                    Secure Chat
                  </td>
                </tr>

                <tr>
                  <td align="center" style="font-size: 24px; font-weight: 800; color: #0F172A; padding-bottom: 12px; letter-spacing: -0.5px;">
                    Your Verification Code
                  </td>
                </tr>

                <tr>
                  <td align="center" style="font-size: 15px; line-height: 1.6; color: #475569; padding-bottom: 32px;">
                    Use the verification code below to reset your password.
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #F1F5F9; border-radius: 12px; width: 100%;">
                      <tr>
                        <td align="center" style="padding: 20px 10px; font-size: 38px; font-weight: 800; color: #1E293B; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">
                          ${otp}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <span style="font-size: 13px; font-weight: 600; color: #EF4444; background-color: #FEF2F2; border-radius: 8px; padding: 8px 16px; display: inline-block;">
                      ⏰ This code will expire in <strong>10 minutes</strong>.
                    </span>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="font-size: 13px; line-height: 1.5; color: #94A3B8; padding-bottom: 32px; border-top: 1px solid #F1F5F9; padding-top: 24px;">
                    If you didn't request this password reset, you can safely ignore this email.
                  </td>
                </tr>

                <tr>
                  <td align="center" style="font-size: 14px; line-height: 1.5; color: #64748B;">
                    Regards,<br>
                    <strong style="color: #475569;">Secure Chat Team</strong>
                  </td>
                </tr>
              </table>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; padding-top: 24px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #94A3B8; line-height: 1.5;">
                    This is an automated message, please do not reply directly. &copy; 2026 Secure Chat. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ OTP email sent successfully to ${email}. MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}. Error:`, error);
    throw error;
  }
};

module.exports = { sendOTPEmail };
