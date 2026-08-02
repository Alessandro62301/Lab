export type PresenceMetricEvent = {
  eventName: string;
  anonymousId?: string | null;
  entityId?: string | null;
};

export function summarizePresenceEvents(events: PresenceMetricEvent[]) {
  const views = events.filter((event) => event.eventName === "page_view");
  const clicks = events.filter((event) => event.eventName === "link_click");
  const uniqueVisitors = new Set(
    views.map((event) => event.anonymousId).filter(Boolean),
  ).size;
  const clicksByEntity = clicks.reduce<Record<string, number>>((totals, event) => {
    if (event.entityId) totals[event.entityId] = (totals[event.entityId] ?? 0) + 1;
    return totals;
  }, {});

  return {
    views: views.length,
    uniqueVisitors,
    clicks: clicks.length,
    clickRate: views.length ? Number(((clicks.length / views.length) * 100).toFixed(1)) : 0,
    clicksByEntity,
  };
}
