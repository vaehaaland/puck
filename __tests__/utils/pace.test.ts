import { describe, it, expect } from "vitest";
import { formatPace, calcPaceSeconds, formatDuration } from "@/lib/utils/pace";

describe("formatPace", () => {
  it("formats 300 seconds as 5:00 /km", () => {
    expect(formatPace(300)).toBe("5:00 /km");
  });

  it("formats 267 seconds as 4:27 /km", () => {
    expect(formatPace(267)).toBe("4:27 /km");
  });

  it("formats 360 seconds as 6:00 /km", () => {
    expect(formatPace(360)).toBe("6:00 /km");
  });

  it("pads seconds with leading zero", () => {
    expect(formatPace(305)).toBe("5:05 /km");
  });
});

describe("calcPaceSeconds", () => {
  it("returns correct pace for 5km in 25 minutes", () => {
    // 25 min = 1500 sec / 5km = 300 sec/km
    expect(calcPaceSeconds(5, 1500)).toBe(300);
  });

  it("returns 0 for zero distance", () => {
    expect(calcPaceSeconds(0, 1500)).toBe(0);
  });

  it("rounds to nearest second", () => {
    // 10km in 47 min = 2820 sec / 10 = 282 sec/km
    expect(calcPaceSeconds(10, 2820)).toBe(282);
  });
});

describe("formatDuration", () => {
  it("formats 65 seconds as 1:05", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formats 3600 seconds as 1:00:00", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
  });

  it("formats 3661 seconds as 1:01:01", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("formats 300 seconds as 5:00", () => {
    expect(formatDuration(300)).toBe("5:00");
  });
});
