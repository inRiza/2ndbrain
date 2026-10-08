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
  expect(a).toContain('dominant-baseline="central"');
});

test("normalizeAvatarSvg fixes legacy vertical text position", () => {
  const legacy = generateAvatarSvg("ada", "one").replace(
    'y="48" text-anchor="middle" dominant-baseline="central"',
    'y="54" text-anchor="middle"',
  );
  expect(normalizeAvatarSvg(legacy)).toContain('dominant-baseline="central"');
});
