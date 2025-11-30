export function reservationConfirmationEmail(reservation, client = {}) {
  const subject = `Confirmation de réservation ${reservation.reservationId}`;
  const start = new Date(reservation.startDate).toLocaleDateString('fr-FR');
  const end = new Date(reservation.endDate).toLocaleDateString('fr-FR');
  const bodyHtml = `
    <p>Bonjour ${client.firstName || ''} ${client.lastName || ''},</p>
    <p>Votre réservation <strong>${reservation.reservationId}</strong> a bien été enregistrée.</p>
    <ul>
      <li>Véhicule: ${reservation.carBrand} ${reservation.carModel}</li>
      <li>Période: ${start} — ${end} (${reservation.totalDays} jours)</li>
      <li>Montant total: ${reservation.totalAmount}€</li>
      <li>Statut: ${reservation.status}</li>
    </ul>
    <p>Merci de votre confiance.</p>
  `;

  const bodyText = `Bonjour ${client.firstName || ''} ${client.lastName || ''},\n\n` +
    `Votre réservation ${reservation.reservationId} a bien été enregistrée.\n` +
    `Véhicule: ${reservation.carBrand} ${reservation.carModel}\n` +
    `Période: ${start} — ${end} (${reservation.totalDays} jours)\n` +
    `Montant total: ${reservation.totalAmount}€\n\n` +
    `Merci de votre confiance.`;

  return { subject, html: bodyHtml, text: bodyText };
}

export default { reservationConfirmationEmail };
