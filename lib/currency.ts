/** Display price in Australian dollars */
export function formatAUD(amount: number): string {
  return `A$${amount.toFixed(2)}`;
}
