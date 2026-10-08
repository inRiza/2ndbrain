import { expect, test } from "bun:test";
import { validateProjectPassword } from "@/lib/project-shared";
import { generatePublicId } from "@/lib/project-server";

test("validateProjectPassword needs at least four characters", () => {
  expect(validateProjectPassword("abc")).toBeTruthy();
  expect(validateProjectPassword("abcd")).toBe("");
});

test("generatePublicId uses the stk prefix", () => {
  expect(generatePublicId().startsWith("stk-")).toBe(true);
});
