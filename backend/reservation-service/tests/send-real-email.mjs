import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const emailModule = await import('../src/services/emailService.js');
const { sendReservationEmail } = emailModule;

async function main() {
  const to = 'jarraymoufid@gmail.com';
  const subject = 'Test d\'envoi SMTP - E-Krini';
  const text = 'Ceci est un email  envoyé depuis le service de réservation pour dire que reservation confirme.';
  // Debug env presence (do not print secrets)
  // eslint-disable-next-line no-console
  console.log('SMTP_HOST present=', !!process.env.SMTP_HOST, 'SMTP_USER present=', !!process.env.SMTP_USER);

  try {
    const res = await sendReservationEmail(to, subject, text);
    // Don't log secrets; print result summary
    console.log('Envoi tenté. Résultat:', res && res.accepted ? `accepted=${res.accepted.length}` : JSON.stringify(res));
  } catch (err) {
    console.error('Échec envoi email de test:', err.message);
    process.exit(1);
  }
}

await main();
