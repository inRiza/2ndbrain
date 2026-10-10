import { expect, test } from "bun:test";
import { buildBrainGraph } from "@/lib/brain-graph";

test("buildBrainGraph links each author to their ideas and shared tags", () => {
  const graph = buildBrainGraph("stk-1", [
    { slug: "a", title: "Alpha", author: "Ada", topic: "Farm", tags: ["price"] },
    { slug: "b", title: "Beta", author: "Ada", topic: "Farm", tags: ["price"] },
    { slug: "c", title: "Gamma", author: "Bea", topic: "", tags: [] },
  ]);
  const kinds = graph.nodes.map((node) => `${node.kind}:${node.label}`).sort();
  expect(kinds).toEqual(["idea:Alpha", "idea:Beta", "idea:Gamma", "topic:Farm", "user:Ada", "user:Bea"]);
  const pairs = graph.edges.map((edge) => [edge.from, edge.to].sort().join("~")).sort();
  expect(pairs).toContain(["user:ada", "idea:a"].sort().join("~"));
  expect(pairs).toContain(["idea:a", "idea:b"].sort().join("~"));
  expect(pairs).toContain(["idea:c", "user:bea"].sort().join("~"));
});
