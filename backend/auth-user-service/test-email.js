import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from local .env file
dotenv.config();

async function sendTest() {
  try {
    console.log('🧪 Testing Email Configuration...');

    let transporter;

    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Using Ethereal Email for development testing...');
      // Use Ethereal Email for development (free, no domain verification needed)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Ethereal Account:', testAccount.user);
    } else {
      console.log('📧 Using configured SMTP for production...');
      console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
      console.log(`🔌 SMTP Port: ${process.env.SMTP_PORT}`);
      console.log(`👤 Email User: ${process.env.EMAIL_USER}`);

      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Verify connection
    console.log('\n🔗 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.NODE_ENV === 'development'
        ? '"Car Rental System (Dev)" <test@carrental.test>'
        : `"Car Rental System" <${process.env.EMAIL_FROM}>`,
      to: 'kammoun.mohamedaziz@ieee.org', // Send to specified email
      subject: `Test Email — Car Rental Auth Service (${process.env.NODE_ENV || 'development'})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello! 👋</h2>
          <p>This is a test email from your Car Rental System authentication service.</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          ${process.env.NODE_ENV === 'development'
            ? '<p style="color: #28a745;"><strong>✅ Development Mode:</strong> Using Ethereal Email (free testing service)</p>'
            : '<p style="color: #007bff;"><strong>📧 Production Mode:</strong> Using configured SMTP</p>'}
          <hr>
          <p style="color: #666; font-size: 12px;">
            SMTP Host: ${process.env.SMTP_HOST || 'smtp.ethereal.email'}<br>
            This is an automated test message.
          </p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Accepted: ${info.accepted}`);
    console.log(`📧 Rejected: ${info.rejected}`);

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to send test email:', err.message);
    console.error('🔍 Error details:', err);
    process.exit(1);
  }
}

sendTest();