/**
 * Brzycki formula: estimates 1-rep max from weight and reps.
 * w * (36 / (37 - r))
 * Valid for reps 1–36. Returns weight as-is for 1 rep.
 */
export function brzycki(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return 0; // formula breaks down
  return weight * (36 / (37 - reps));
}

export function roundToNearest(value: number, nearest = 2.5): number {
  return Math.round(value / nearest) * nearest;
}
