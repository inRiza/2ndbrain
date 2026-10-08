import { expect, test } from "bun:test";
import { avatarInitials, generateAvatarSvg } from "@/lib/avatar";

test("avatarInitials uses two parts when present", () => {
  expect(avatarInitials("ada_lovelace")).toBe("AL");
  expect(avatarInitials("stacklist")).toBe("ST");
});

test("generateAvatarSvg changes when the seed changes", () => {
  const a = generateAvatarSvg("ada", "one");
  const b = generateAvatarSvg("ada", "two");
  expect(a).toContain("<svg");
  expect(a).not.toBe(b);
});
