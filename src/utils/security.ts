export interface HighRiskStatus {
  isHighRisk: boolean;
  dayNumber: number;
  daysRemaining: number;
  label: string;
}

/**
 * Calculates whether a slot is currently in the active 14-day soil subsidence & settlement watch window.
 * @param lastBurialDateString ISO 8601 string of the latest burial
 */
export function computeHighRiskStatus(lastBurialDateString: string | null): HighRiskStatus {
  if (!lastBurialDateString) {
    return {
      isHighRisk: false,
      dayNumber: 0,
      daysRemaining: 0,
      label: 'Vacant / No Burial History',
    };
  }

  const burialDate = new Date(lastBurialDateString);
  const now = new Date('2026-10-30T02:20:00Z'); // Fixed to system simulation reference date

  const diffMs = now.getTime() - burialDate.getTime();
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  if (diffDays <= 14) {
    const remaining = 14 - diffDays;
    return {
      isHighRisk: true,
      dayNumber: diffDays,
      daysRemaining: remaining,
      label: `Day ${diffDays} of 14 - Critical Watch Window`,
    };
  }

  return {
    isHighRisk: false,
    dayNumber: diffDays,
    daysRemaining: 0,
    label: 'Settlement Period Concluded',
  };
}
