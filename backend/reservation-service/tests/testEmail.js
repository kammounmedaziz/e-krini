import nodemailer from 'nodemailer';

async function main() {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: 'E-Krini Test <no-reply@e-krini.local>',
      to: 'jarraymoufid@gmail.com',
      subject: 'Reservation Service - Test Email',
      text: 'This is a test email from the reservation service (Ethereal).',
      html: '<p>This is a test email from the <strong>reservation service</strong> (Ethereal).</p>',
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('Test email failed:', err);
    process.exit(1);
  }
}

await main();
