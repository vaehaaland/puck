/**
 * Format duration in seconds to mm:ss string.
 */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Calculate pace in seconds per km.
 */
export function calcPaceSeconds(distanceKm: number, durationSeconds: number): number {
  if (distanceKm <= 0) return 0;
  return Math.round(durationSeconds / distanceKm);
}

/**
 * Format pace seconds/km to "m:ss /km" string.
 */
export function formatPace(paceSeconds: number): string {
  const m = Math.floor(paceSeconds / 60);
  const s = paceSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")} /km`;
}
