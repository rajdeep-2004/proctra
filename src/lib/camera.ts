"use client";

export type CameraCheck = { ok: true } | { ok: false; reason: "permission" | "no-camera" | "busy" | "unknown"; message: string };

const SETTINGS_HINT = "Open System Settings → Privacy & Security → Camera, turn on Proctra, then try again.";

/** Turns a getUserMedia error into a reason + plain-language instruction. */
export function describeCameraError(error: unknown): Exclude<CameraCheck, { ok: true }> {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return { ok: false, reason: "permission", message: `Proctra isn't allowed to use the camera. ${SETTINGS_HINT}` };
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return { ok: false, reason: "no-camera", message: "No camera was found. Connect or enable a camera, then try again." };
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return { ok: false, reason: "busy", message: "The camera is being used by another app. Close that app, then try again." };
  }
  return { ok: false, reason: "unknown", message: "The camera couldn't be started. Check it's connected, then try again." };
}

/**
 * Required before starting or resuming an exam (F-04, D-010): OS permission (macOS prompt the first time),
 * then a real test capture so we know a camera actually works. The test stream is stopped immediately.
 */
export async function checkCamera(): Promise<CameraCheck> {
  const desktop = window.proctra;
  if (!desktop) return { ok: false, reason: "unknown", message: "Exams can only be taken in the Proctra desktop app." };
  const permission = await desktop.requestCamera();
  if (!permission.granted) return { ok: false, reason: "permission", message: `Proctra isn't allowed to use the camera. ${SETTINGS_HINT}` };
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach((t) => t.stop());
    return { ok: true };
  } catch (error) {
    return describeCameraError(error);
  }
}
