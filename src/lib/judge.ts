export type JudgeScore = {
  idea: number;
  flow: number;
  faq: number;
  note: string;
};

export function emptyJudge(): JudgeScore {
  return { idea: 0, flow: 0, faq: 0, note: "" };
}

export function parseJudge(raw: string): JudgeScore {
  try {
    const data = JSON.parse(raw) as Partial<JudgeScore>;
    return {
      idea: clampScore(data.idea),
      flow: clampScore(data.flow),
      faq: clampScore(data.faq),
      note: typeof data.note === "string" ? data.note.slice(0, 500) : "",
    };
  } catch {
    return emptyJudge();
  }
}

export function judgeTotal(score: JudgeScore) {
  return score.idea + score.flow + score.faq;
}

export function rankScores<T extends { title: string; score: JudgeScore }>(
  rows: T[],
) {
  const sorted = [...rows].sort((a, b) => {
    const diff = judgeTotal(b.score) - judgeTotal(a.score);
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });
  let lastTotal = -1;
  let rank = 0;
  return sorted.map((row, index) => {
    const total = judgeTotal(row.score);
    if (total !== lastTotal) {
      rank = index + 1;
      lastTotal = total;
    }
    return { ...row, rank, total };
  });
}

export type Vote = JudgeScore & {
  username: string;
};

export function parseVotes(raw: string): Vote[] {
  try {
    const data = JSON.parse(raw) as unknown;
    if (Array.isArray(data)) {
      const seen = new Set<string>();
      return data.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Partial<Vote>;
        const score = parseJudge(JSON.stringify(record));
        if (judgeTotal(score) === 0 && !score.note) return [];
        const username = typeof record.username === "string" ? record.username.trim() : "";
        if (!username || seen.has(username)) return [];
        seen.add(username);
        return [{ ...score, username }];
      });
    }
    const score = parseJudge(raw);
    if (judgeTotal(score) === 0 && !score.note) return [];
    return [{ ...score, username: defaultVoter }];
  } catch {
    return [];
  }
}

export function voteBy(votes: Vote[], username: string): JudgeScore {
  return votes.find((vote) => vote.username === username) ?? emptyJudge();
}

export function upsertVote(votes: Vote[], vote: Vote) {
  return [vote, ...votes.filter((item) => item.username !== vote.username)];
}

export function averageScore(votes: Vote[]): JudgeScore {
  if (votes.length === 0) return emptyJudge();
  const mean = (key: "idea" | "flow" | "faq") =>
    Math.round(votes.reduce((sum, vote) => sum + vote[key], 0) / votes.length);
  return { idea: mean("idea"), flow: mean("flow"), faq: mean("faq"), note: "" };
}

const defaultVoter = "stacklist";

export function judgeStorageKey(projectId: string, slug: string) {
  return `stacklist-judge:${projectId}:${slug}`;
}

function clampScore(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) return 0;
  if (value < 1 || value > 5) return 0;
  return value;
}
