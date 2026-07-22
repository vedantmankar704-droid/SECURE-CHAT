const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
  // If credentials are not present in .env, we can auto-create a mock ethereal transporter
  let transporter;
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Ethereal test transporter fallback (so development always works out of the box!)
    console.log(`⚠️ EMAIL_USER/EMAIL_PASS not configured in .env. Using mock ethereal transporter.`);
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 588,
      secure: false,
      auth: {
        user: 'mock.user@ethereal.email',
        pass: 'mockPassword'
      }
    });
  }

  const mailOptions = {
    from: `"Secure Chat Support" <${process.env.EMAIL_USER || 'no-reply@securechat.com'}>`,
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

  // If using Ethereal fallback, log the OTP directly so developer can see it in terminal
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n==========================================`);
    console.log(`✉️  [MOCK EMAIL SENT TO: ${email}]`);
    console.log(`🔑  YOUR OTP CODE: ${otp}`);
    console.log(`==========================================\n`);
    return { mock: true, otp };
  }

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
