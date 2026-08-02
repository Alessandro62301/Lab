import { describe, expect, it } from "vitest";

import { summarizePresenceEvents } from "./metrics";

describe("métricas do Presença", () => {
  it("calcula visualizações, cliques, visitantes únicos e CTR", () => {
    const summary = summarizePresenceEvents([
      { eventName: "page_view", anonymousId: "a" },
      { eventName: "page_view", anonymousId: "a" },
      { eventName: "page_view", anonymousId: "b" },
      { eventName: "link_click", anonymousId: "a", entityId: "link-1" },
      { eventName: "link_click", anonymousId: "b", entityId: "link-1" },
      { eventName: "link_click", anonymousId: "b", entityId: "link-2" },
    ]);

    expect(summary).toEqual({
      views: 3,
      uniqueVisitors: 2,
      clicks: 3,
      clickRate: 100,
      clicksByEntity: { "link-1": 2, "link-2": 1 },
    });
  });

  it("não divide por zero quando a página ainda não recebeu visitas", () => {
    expect(summarizePresenceEvents([]).clickRate).toBe(0);
  });
});
