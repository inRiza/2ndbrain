import { expect, test } from "bun:test";
import { avatarInitials, generateAvatarSvg, normalizeAvatarSvg } from "@/lib/avatar";

test("avatarInitials uses two parts when present", () => {
  expect(avatarInitials("ada_lovelace")).toBe("AL");
  expect(avatarInitials("stacklist")).toBe("ST");
});

test("generateAvatarSvg changes when the seed changes", () => {
  const a = generateAvatarSvg("ada", "one");
  const b = generateAvatarSvg("ada", "two");
  expect(a).toContain("<svg");
  expect(a).not.toBe(b);
  expect(a).toContain('transform="translate(48,48)"');
  expect(a).toContain('dominant-baseline="middle"');
});

test("normalizeAvatarSvg fixes legacy vertical text position", () => {
  const legacy = `<svg viewBox="0 0 96 96"><text x="48" y="54" text-anchor="middle">AL</text></svg>`;
  const fixed = normalizeAvatarSvg(legacy);
  expect(fixed).toContain('transform="translate(48,48)"');
  expect(fixed).toContain(">AL<");
});
