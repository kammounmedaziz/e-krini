export const computeSeasonalPrice = (basePrice) => {
  // basePrice expected as number
  const m = new Date().getMonth(); // 0-based
  let price = Number(basePrice);
  if (Number.isNaN(price)) return basePrice;

  // High season: July (6) & August (7) => +25%
  if (m === 6 || m === 7) {
    return Math.round(price * 1.25 * 100) / 100;
  }

  // Low season: December (11) & January (0) => -10%
  if (m === 11 || m === 0) {
    return Math.round(price * 0.9 * 100) / 100;
  }

  return price;
};
