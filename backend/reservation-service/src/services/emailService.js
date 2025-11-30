import mailer from '../utils/mailer.js';
import templates from '../utils/emailTemplates.js';

export async function sendReservationEmail(to, subjectOrText, textOrUndefined) {
  if (typeof textOrUndefined !== 'undefined') {
    const subject = subjectOrText;
    const text = textOrUndefined;
    return mailer.sendMail({ to, subject, text });
  }

  const reservation = subjectOrText;
  const client = {};
  const { subject, html, text } = templates.reservationConfirmationEmail(reservation, client);
  return mailer.sendMail({ to, subject, html, text });
}

export default { sendReservationEmail };
