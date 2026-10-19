"use client";

import { useCallback, useEffect, useRef } from "react";

export type ClientEventType =
  | "window_blur" | "window_focus" | "tab_hidden" | "tab_visible" | "fullscreen_exit"
  | "camera_lost" | "camera_restored" | "snapshot_failed";

type Pending = { type: ClientEventType; occurredAt: string };
const MAX_BUFFER = 200; // if offline for a long time, keep the most recent ones

/**
 * Neutral event log (F-09): records window/tab/fullscreen changes and lets other hooks log camera/snapshot
 * events. Sent in batches every 5 s and once more when stopped (submit / time's up).
 */
export function useProctorEvents(attemptId: string, active: boolean) {
  const buffer = useRef<Pending[]>([]);
  const sending = useRef(false);

  const flush = useCallback(async () => {
    if (sending.current || buffer.current.length === 0) return;
    sending.current = true;
    const batch = buffer.current.splice(0, 50);
    try {
      const res = await fetch(`/api/v1/attempts/${attemptId}/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true, // lets the final flush finish even if the window is closing
      });
      if (!res.ok && res.status >= 500) buffer.current.unshift(...batch); // server hiccup: try again later
    } catch {
      buffer.current.unshift(...batch); // offline: keep for the next flush
    } finally {
      buffer.current = buffer.current.slice(-MAX_BUFFER);
      sending.current = false;
    }
  }, [attemptId]);

  const log = useCallback((type: ClientEventType) => {
    buffer.current.push({ type, occurredAt: new Date().toISOString() });
  }, []);

  useEffect(() => {
    if (!active) return;
    const onBlur = () => log("window_blur");
    const onFocus = () => log("window_focus");
    const onVisibility = () => log(document.visibilityState === "hidden" ? "tab_hidden" : "tab_visible");
    const onFullscreen = () => { if (!document.fullscreenElement) log("fullscreen_exit"); };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    const timer = setInterval(() => void flush(), 5000);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      clearInterval(timer);
      void flush(); // final send when the exam stops
    };
  }, [active, log, flush]);

  return { log, flush };
}
