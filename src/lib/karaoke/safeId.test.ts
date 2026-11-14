import { describe, expect, it } from "vitest";
import { parseSafeSongId } from "./safeId";
import { resolveUnderRoot, APPROVED_DIR, approvedPath } from "./store";
import path from "path";

describe("safe song ids", () => {
  it("accepts catalog slugs", () => {
    expect(parseSafeSongId("hat-mua-vuong-van")).toBe("hat-mua-vuong-van");
    expect(parseSafeSongId("ngay-mai-nguoi-ta-lay-chong")).toBe("ngay-mai-nguoi-ta-lay-chong");
  });

  it("rejects path traversal and separators", () => {
    expect(parseSafeSongId("../etc/passwd")).toBeNull();
    expect(parseSafeSongId("foo/bar")).toBeNull();
    expect(parseSafeSongId("foo\\bar")).toBeNull();
    expect(parseSafeSongId("..")).toBeNull();
    expect(parseSafeSongId("")).toBeNull();
    expect(parseSafeSongId("Has Caps")).toBeNull();
  });

  it("keeps approved paths under data/karaoke/approved", () => {
    const p = approvedPath("hat-mua-vuong-van");
    expect(p.startsWith(path.resolve(APPROVED_DIR))).toBe(true);
    expect(() => resolveUnderRoot(APPROVED_DIR, "..", "secrets.json")).toThrow();
    expect(() => approvedPath("../../x")).toThrow();
  });
});
