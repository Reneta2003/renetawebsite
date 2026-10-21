/** Date and label formatting shared by every component, so the site speaks with one voice. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface PartialDate {
  year: number;
  month?: number;
}

export function parsePartialDate(value: string): PartialDate {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

const shortYear = (year: number) => String(year).slice(-2);

/**
 * Human-readable range.
 *  "2025-11" ongoing          → "Nov 2025 – now"
 *  "2026-08" → "2026-10"      → "Aug – Oct 2026"
 *  "2022-07" → "2024-05"      → "Jul 2022 – May 2024"
 *  yearsOnly, 2022 → 2023     → "2022–23"
 */
export function formatRange(
  start: string,
  end: string | undefined,
  { ongoing = false, yearsOnly = false, ongoingLabel = 'now' } = {},
): string {
  const s = parsePartialDate(start);
  const e = end ? parsePartialDate(end) : undefined;

  if (yearsOnly || s.month === undefined) {
    if (ongoing) return `${s.year} – ${ongoingLabel}`;
    if (!e || e.year === s.year) return String(s.year);
    return `${s.year}–${shortYear(e.year)}`;
  }

  const startLabel = `${MONTHS[s.month - 1]} ${s.year}`;
  if (ongoing) return `${startLabel} – ${ongoingLabel}`;
  if (!e) return startLabel;
  if (e.month === undefined) return `${startLabel} – ${e.year}`;
  if (e.year === s.year) return `${MONTHS[s.month - 1]} – ${MONTHS[e.month - 1]} ${e.year}`;
  return `${startLabel} – ${MONTHS[e.month - 1]} ${e.year}`;
}

const CEFR_SCALE = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_SCALE)[number] | 'native';

/** Number of filled steps (out of six) for a CEFR level. */
export function cefrSteps(level: CefrLevel): number {
  return level === 'native' ? CEFR_SCALE.length : CEFR_SCALE.indexOf(level) + 1;
}
export const CEFR_MAX = CEFR_SCALE.length;

/** Joins non-empty parts with a middle dot. */
export const dotJoin = (...parts: Array<string | undefined | false>) => parts.filter(Boolean).join(' · ');
