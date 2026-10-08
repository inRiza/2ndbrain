import { expect, test } from "bun:test";
import { flowLayers, parseIdea } from "@/lib/idea-doc";

const sample = `---
title: Campus queue
summary: One line for the lobby.
updated: 2026-10-01
tags: campus, queue
---

## Idea

Students join one queue.

## Flow

- Open the page -> Take a number
- Take a number -> Wait
- Take a number -> Queue is full
- not an edge

## FAQ

### Why one counter?
The demo has to finish in a weekend.

### What if nobody is waiting?
The screen says the queue is empty.

## References

- [Queue study](https://example.com/study) — why it fails today
- [Blocked](javascript:alert(1)) — drop this

## Design

- One primary action

## Sites

- [Vercel](https://vercel.com) — deploy
`;

test("parseIdea maps flow and faq", () => {
  const idea = parseIdea("campus-queue", sample);
  expect(idea.title).toBe("Campus queue");
  expect(idea.idea).toBe("Students join one queue.");
  expect(idea.flow).toEqual([
    { from: "Open the page", to: "Take a number" },
    { from: "Take a number", to: "Wait" },
    { from: "Take a number", to: "Queue is full" },
  ]);
  expect(flowLayers(idea.flow)).toEqual([
    ["Open the page"],
    ["Take a number"],
    ["Wait", "Queue is full"],
  ]);
  expect(idea.faq).toEqual([
    {
      question: "Why one counter?",
      answer: "The demo has to finish in a weekend.",
    },
    {
      question: "What if nobody is waiting?",
      answer: "The screen says the queue is empty.",
    },
  ]);
  expect(idea.references[0]?.href).toBe("https://example.com/study");
  expect(idea.sites[0]?.href).toBe("https://vercel.com");
});
