import { expect, test } from "bun:test";
import { parseStoredList, slugFromName } from "@/lib/local-ideas";

test("slugFromName keeps a markdown file name usable as a route", () => {
  expect(slugFromName("Antrian Kampus.md")).toBe("antrian-kampus");
  expect(slugFromName("notes")).toBe("notes");
});

test("parseStoredList drops broken rows", () => {
  const raw = JSON.stringify([
    { slug: "brief-sponsor", source: "---\ntitle: Brief\n" },
    { slug: "../secret", source: "nope" },
    { slug: "empty", source: "  " },
  ]);
  expect(parseStoredList(raw)).toEqual([
    { slug: "brief-sponsor", source: "---\ntitle: Brief\n", topic: "", author: "" },
  ]);
  expect(parseStoredList("nope")).toEqual([]);
});
