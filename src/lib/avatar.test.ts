import { expect, test } from "bun:test";
import { avatarInitials, generateAvatarSvg, normalizeAvatarSvg } from "@/lib/avatar";

test("avatarInitials uses two parts when present", () => {
  expect(avatarInitials("ada_lovelace")).toBe("AL");
  expect(avatarInitials("stacklist")).toBe("ST");
});

test("generateAvatarSvg uses a flat pastel for a chosen color", () => {
  const svg = generateAvatarSvg("ada", "sage");
  expect(svg).toContain('fill="#cfe3c8"');
  expect(svg).not.toContain("linearGradient");
  expect(svg).toContain('transform="translate(48,48)"');
});

test("normalizeAvatarSvg fixes legacy vertical text position", () => {
  const legacy = `<svg viewBox="0 0 96 96"><text x="48" y="54" text-anchor="middle">AL</text></svg>`;
  const fixed = normalizeAvatarSvg(legacy);
  expect(fixed).toContain('transform="translate(48,48)"');
  expect(fixed).toContain(">AL<");
});
