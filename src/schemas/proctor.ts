import { z } from "zod";

// Must match EVENT_TYPES in src/models/proctor-event.ts. "resumed" is recorded by the server, not accepted from clients.
export const CLIENT_EVENT_TYPES = [
  "window_blur", "window_focus", "tab_hidden", "tab_visible", "fullscreen_exit", "camera_lost", "camera_restored", "snapshot_failed",
] as const;

export const EventsInput = z.object({
  events: z
    .array(z.object({ type: z.enum(CLIENT_EVENT_TYPES), occurredAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)) }))
    .min(1)
    .max(50),
});
export type EventsInput = z.infer<typeof EventsInput>;
