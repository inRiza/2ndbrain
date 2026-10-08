import { expect, test } from "bun:test";
import {
  averageScore,
  emptyJudge,
  judgeTotal,
  parseJudge,
  parseVotes,
  rankScores,
} from "@/lib/judge";

test("parseJudge keeps a 1 to 5 score and drops junk", () => {
  expect(parseJudge("nope")).toEqual(emptyJudge());
  const score = parseJudge(
    JSON.stringify({
      idea: 4,
      flow: 9,
      faq: 3,
      note: "ship the lobby",
    }),
  );
  expect(score).toEqual({
    idea: 4,
    flow: 0,
    faq: 3,
    note: "ship the lobby",
  });
  expect(judgeTotal(score)).toBe(7);
});

test("rankScores puts the higher total first and shares a tie", () => {
  const ranked = rankScores([
    { title: "Beta", score: { ...emptyJudge(), idea: 2, flow: 2, faq: 2 } },
    { title: "Alpha", score: { ...emptyJudge(), idea: 5, flow: 5, faq: 5 } },
    { title: "Gamma", score: { ...emptyJudge(), idea: 2, flow: 2, faq: 2 } },
  ]);
  expect(ranked.map((row) => [row.rank, row.title])).toEqual([
    [1, "Alpha"],
    [2, "Beta"],
    [2, "Gamma"],
  ]);
});

test("parseVotes keeps one score per username and averages them", () => {
  const votes = parseVotes(
    JSON.stringify([
      { username: "ada", idea: 4, flow: 4, faq: 2, note: "" },
      { username: "ada", idea: 1, flow: 1, faq: 1, note: "" },
      { username: "", idea: 5, flow: 5, faq: 5, note: "" },
    ]),
  );
  expect(votes.map((vote) => vote.username)).toEqual(["ada"]);
  expect(averageScore(votes)).toEqual({ idea: 4, flow: 4, faq: 2, note: "" });
  const legacy = parseVotes(JSON.stringify({ idea: 5, flow: 5, faq: 5, note: "" }));
  expect(legacy[0]?.username).toBe("stacklist");
});
