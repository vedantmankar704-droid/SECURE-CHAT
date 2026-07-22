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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">🔒 Secure Chat - Password Reset OTP</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Use the following 6-digit One-Time Password (OTP) to complete the verification:</p>
        <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; padding: 15px; background: #f3f4f6; border-radius: 5px; color: #1e1b4b; letter-spacing: 5px;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong> and can only be used once. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">Secure Chat Application &copy; 2026</p>
      </div>
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
