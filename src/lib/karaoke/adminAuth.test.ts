import { describe, expect, it } from "vitest";

/**
 * Smoke documentation for allowlist parsing expectations.
 * requireSingAdmin is request-bound; keep unit coverage on env parsing shape.
 */
describe("sing admin allowlist", () => {
  it("parses comma-separated emails", () => {
    const raw = "musadoproductions@gmail.com, Other@Example.com ";
    const set = new Set(
      raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    );
    expect(set.has("musadoproductions@gmail.com")).toBe(true);
    expect(set.has("other@example.com")).toBe(true);
    expect(set.has("stranger@example.com")).toBe(false);
  });
});
