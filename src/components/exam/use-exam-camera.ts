"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "starting" | "live" | "lost";

const HEALTH_CHECK_MS = 2000;

/**
 * Keeps the camera on during an active attempt WITHOUT showing it (no live preview, F-07): the stream plays
 * into a video element that is never added to the page. Detects the camera disappearing (track ended,
 * device unplugged) and keeps retrying every 2 s; reports lost/restored so the page can block the exam (D-010).
 */
export function useExamCamera(active: boolean, onLost: () => void, onRestored: () => void) {
  const [status, setStatus] = useState<CameraStatus>("starting");
  const statusRef = useRef<CameraStatus>("starting");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const busy = useRef(false);
  const callbacks = useRef({ onLost, onRestored });
  useEffect(() => { callbacks.current = { onLost, onRestored }; }, [onLost, onRestored]);

  const set = (s: CameraStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const markLost = useCallback(() => {
    if (statusRef.current === "lost") return;
    stopStream();
    set("lost");
    callbacks.current.onLost(); // also when the camera fails right at the start
  }, []);

  const tryStart = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      const video = videoRef.current ?? Object.assign(document.createElement("video"), { muted: true, playsInline: true });
      videoRef.current = video;
      video.srcObject = stream;
      await video.play();
      streamRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => markLost());
      const wasLost = statusRef.current === "lost";
      set("live");
      if (wasLost) callbacks.current.onRestored();
    } catch {
      markLost();
    } finally {
      busy.current = false;
    }
  }, [markLost]);

  useEffect(() => {
    if (!active) return;
    // Started from a timer callback (not synchronously in the effect), like any external subscription.
    const first = setTimeout(() => void tryStart(), 0);
    const timer = setInterval(() => {
      const track = streamRef.current?.getVideoTracks()[0];
      if (statusRef.current === "live" && (!track || track.readyState === "ended" || track.muted && !track.enabled)) markLost();
      else if (statusRef.current === "lost") void tryStart();
    }, HEALTH_CHECK_MS);
    const onDeviceChange = () => {
      const track = streamRef.current?.getVideoTracks()[0];
      if (!track || track.readyState === "ended") markLost();
    };
    navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
      stopStream(); // camera off as soon as the attempt stops
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [active, tryStart, markLost]);

  /** One still frame as a JPEG (≈640×480, quality 0.7), or null if the camera isn't live. */
  const grabFrame = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (statusRef.current !== "live" || !video || video.videoWidth === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.7));
  }, []);

  return { status, grabFrame };
}
