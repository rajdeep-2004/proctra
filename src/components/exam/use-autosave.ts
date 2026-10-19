"use client";

import { useEffect, useRef, useState } from "react";
import { SaveQueue, type Answer, type KeyValueStore, type SaveStatus, type SendResult } from "@/components/exam/save-queue";

/** localStorage, or null when it's blocked (private mode, disabled storage). */
export function safeStorage(): KeyValueStore | null {
  try {
    const k = "__proctra_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** PUT one answer and translate the HTTP outcome for the queue. */
function makeSender(attemptId: string) {
  return async (questionId: string, answer: Answer): Promise<SendResult> => {
    const res = await fetch(`/api/v1/attempts/${attemptId}/answers/${questionId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(answer),
      cache: "no-store",
    });
    if (res.ok) return "ok";
    if (res.status === 409) return "closed"; // ATTEMPT_CLOSED — the exam is over
    if (res.status === 400 || res.status === 404) return "drop"; // invalid; retrying can't fix it
    return "retry"; // 5xx, 401 hiccups, etc.
  };
}

export function useAutosave(attemptId: string, onClosed: () => void) {
  const queueRef = useRef<SaveQueue | null>(null);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const onClosedRef = useRef(onClosed);
  useEffect(() => { onClosedRef.current = onClosed; }, [onClosed]);

  useEffect(() => {
    const queue = new SaveQueue({
      attemptId,
      send: makeSender(attemptId),
      storage: safeStorage(),
      onStatus: setStatus,
      onClosed: () => onClosedRef.current(),
    });
    queueRef.current = queue;
    queue.replayPending(); // anything left unconfirmed from before a reload/crash
    const online = () => queue.retryNow();
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("online", online);
      queue.stop();
    };
  }, [attemptId]);

  return {
    status,
    enqueue: (questionId: string, answer: Answer) => queueRef.current?.enqueue(questionId, answer),
    flush: (timeoutMs?: number) => queueRef.current?.flush(timeoutMs) ?? Promise.resolve(true),
  };
}

/** Unconfirmed answers from storage, to show on first render (they are newer than the server's copy). */
export function readPending(attemptId: string): Record<string, Answer> {
  try {
    const raw = safeStorage()?.getItem(`proctra:pending:${attemptId}`);
    return raw ? (JSON.parse(raw) as Record<string, Answer>) : {};
  } catch {
    return {};
  }
}
