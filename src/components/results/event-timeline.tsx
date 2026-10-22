import { LocalTime } from "@/components/local-time";
import type { EventType } from "@/models/proctor-event";

// Neutral, factual wording only — these are not signs of cheating (PRD §9).
const LABEL: Record<EventType, string> = {
  window_blur: "Exam window lost focus",
  window_focus: "Exam window regained focus",
  tab_hidden: "Exam page was hidden",
  tab_visible: "Exam page visible again",
  fullscreen_exit: "Left full screen",
  camera_lost: "Camera disconnected",
  camera_restored: "Camera reconnected",
  snapshot_failed: "A snapshot couldn't be uploaded",
  resumed: "Student reopened the exam",
};

const PAIRS: Partial<Record<EventType, EventType>> = { window_blur: "window_focus", tab_hidden: "tab_visible", camera_lost: "camera_restored" };

function secondsBetween(a: string, b: string) {
  return Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 1000));
}

/** Time-ordered list; "lost/regained" pairs show how long the gap lasted. */
export function EventTimeline({ events }: { events: { type: EventType; occurredAt: string }[] }) {
  if (events.length === 0) return <p className="text-sm text-muted-foreground">No events were recorded.</p>;
  return (
    <ol className="grid gap-2 text-sm">
      {events.map((e, i) => {
        const closer = PAIRS[e.type];
        const end = closer ? events.slice(i + 1).find((x) => x.type === closer) : undefined;
        return (
          <li key={i} className="flex flex-wrap items-baseline gap-x-3">
            <LocalTime iso={e.occurredAt} className="w-40 shrink-0 tabular-nums text-muted-foreground" />
            <span>
              {LABEL[e.type]}
              {end && <span className="text-muted-foreground">, back after {secondsBetween(e.occurredAt, end.occurredAt)} s</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
