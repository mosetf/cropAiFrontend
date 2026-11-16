/**
 * Unit helpers. The model works in tonnes per hectare; many farmers think in
 * acres, and maize is sold in 90 kg bags.
 */

const HECTARES_PER_ACRE = 0.404686;
const KG_PER_MAIZE_BAG = 90;

export function tonnesPerAcre(tonnesPerHectare: number): number {
  return tonnesPerHectare * HECTARES_PER_ACRE;
}

/** 90 kg bags per acre. Only meaningful for maize, so other crops get null. */
export function maizeBagsPerAcre(crop: string, tonnesPerHectare: number): number | null {
  if (crop !== 'maize') return null;
  return (tonnesPerAcre(tonnesPerHectare) * 1000) / KG_PER_MAIZE_BAG;
}

const KES = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 });

/** "KES 67,246" (negative values keep their sign: "-KES 8,300"). */
export function formatKes(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded < 0 ? '-' : ''}KES ${KES.format(Math.abs(rounded))}`;
}

/**
 * Shortens the backend's harvest window ("December 04, 2026 to December 24, 2026")
 * to "4 to 24 Dec 2026". Anything in another format is returned unchanged.
 */
export function formatWindow(text: string): string {
  const match = text.match(/^([A-Za-z]+) (\d{1,2}), (\d{4}) to ([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (!match) return text;
  const [, month1, day1, year1, month2, day2, year2] = match;
  const short = (month: string) => month.slice(0, 3);
  if (year1 === year2) {
    return month1 === month2
      ? `${Number(day1)} to ${Number(day2)} ${short(month2)} ${year2}`
      : `${Number(day1)} ${short(month1)} to ${Number(day2)} ${short(month2)} ${year2}`;
  }
  return `${Number(day1)} ${short(month1)} ${year1} to ${Number(day2)} ${short(month2)} ${year2}`;
}

/** "26 Aug 2026" from an ISO date or datetime string; falls back to the input. */
export function formatDate(iso: string): string {
  const parsed = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
