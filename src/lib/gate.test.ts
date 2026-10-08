import { expect, test } from "bun:test";
import { normalizeUsername, validateUsername } from "@/lib/auth-shared";

test("validateUsername accepts a normal handle", () => {
  expect(validateUsername("stacklist")).toBe("");
  expect(validateUsername("a")).toBeTruthy();
});

test("normalizeUsername trims and lowercases", () => {
  expect(normalizeUsername(" StackList ")).toBe("stacklist");
});
