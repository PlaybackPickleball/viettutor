import { describe, expect, it } from "vitest";

describe("sing admin userId allowlist", () => {
  it("parses comma-separated Cursor user ids", () => {
    const raw = "54786101, 99 ";
    const set = new Set(
      raw
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0),
    );
    expect(set.has(54786101)).toBe(true);
    expect(set.has(99)).toBe(true);
    expect(set.has(1)).toBe(false);
  });
});
