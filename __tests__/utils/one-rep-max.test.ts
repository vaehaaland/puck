import { describe, it, expect } from "vitest";
import { brzycki } from "@/lib/utils/one-rep-max";

describe("brzycki", () => {
  it("returns weight as-is for 1 rep", () => {
    expect(brzycki(100, 1)).toBe(100);
  });

  it("calculates correct 1RM for 80kg × 10 reps", () => {
    // 80 * (36 / (37 - 10)) = 80 * (36/27) ≈ 106.67
    const result = brzycki(80, 10);
    expect(result).toBeCloseTo(106.67, 1);
  });

  it("calculates correct 1RM for 100kg × 5 reps", () => {
    // 100 * (36 / (37 - 5)) = 100 * (36/32) = 112.5
    expect(brzycki(100, 5)).toBeCloseTo(112.5, 1);
  });

  it("returns 0 for 0 reps", () => {
    expect(brzycki(100, 0)).toBe(0);
  });

  it("returns 0 for reps >= 37 to avoid division by zero", () => {
    expect(brzycki(100, 37)).toBe(0);
    expect(brzycki(100, 40)).toBe(0);
  });

  it("handles negative reps gracefully", () => {
    expect(brzycki(100, -1)).toBe(0);
  });
});
