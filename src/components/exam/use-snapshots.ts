"use client";

import { useEffect, useRef } from "react";

const INTERVAL_MS = 10_000; // F-07: one still every 10 s
const RETRY_DELAYS_MS = [2_000, 5_000]; // then give up on this frame and log snapshot_failed

/**
 * Captures a still every 10 s while `active` (attempt running AND camera live) and uploads it. Failures retry
 * twice, then are logged as a neutral `snapshot_failed` event; they never block the exam (system-design §2).
 */
export function useSnapshots(
  attemptId: string,
  active: boolean,
  grabFrame: () => Promise<Blob | null>,
  onFailed: () => void,
  onClosed: () => void,
) {
  const cbs = useRef({ grabFrame, onFailed, onClosed });
  useEffect(() => { cbs.current = { grabFrame, onFailed, onClosed }; }, [grabFrame, onFailed, onClosed]);

  useEffect(() => {
    if (!active) return;
    let stopped = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function upload(frame: Blob, capturedAt: string): Promise<"ok" | "closed" | "failed"> {
      for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
        if (stopped) return "ok";
        try {
          const body = new FormData();
          body.append("image", frame, "snapshot.jpg");
          body.append("capturedAt", capturedAt);
          const res = await fetch(`/api/v1/attempts/${attemptId}/snapshots`, { method: "POST", body });
          if (res.ok) return "ok";
          if (res.status === 409) return "closed";
          if (res.status === 400 || res.status === 413) return "failed"; // retrying the same bytes won't help
        } catch {
          // network error → retry
        }
        if (i < RETRY_DELAYS_MS.length) await sleep(RETRY_DELAYS_MS[i]);
      }
      return "failed";
    }

    async function captureOnce() {
      const frame = await cbs.current.grabFrame();
      if (!frame || stopped) return;
      const result = await upload(frame, new Date().toISOString());
      if (result === "failed") cbs.current.onFailed();
      if (result === "closed") cbs.current.onClosed();
    }

    const first = setTimeout(() => void captureOnce(), 2_000); // one shortly after the camera starts
    const timer = setInterval(() => void captureOnce(), INTERVAL_MS);
    return () => {
      stopped = true;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [attemptId, active]);
}
