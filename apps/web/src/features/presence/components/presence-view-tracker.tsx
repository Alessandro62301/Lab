"use client";

import { useEffect, useRef } from "react";

export function PresenceViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const storageKey = "lab_presence_session";
    const sessionId = sessionStorage.getItem(storageKey) ?? crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId);
    void fetch(`/api/public/presence/${slug}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      keepalive: true,
    });
  }, [slug]);

  return null;
}
