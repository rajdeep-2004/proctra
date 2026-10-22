// Conversions between ISO instants (what the API stores, UTC) and the browser's local time (D-037).
// Only call these in the browser: on the server "local" means the server's time zone (UTC on Vercel).

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO string → value for <input type="datetime-local"> in the viewer's local time ("2026-10-22T15:30"). */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local value (local time, no zone) → ISO string in UTC. Empty → null. */
export function fromLocalInput(local: string): string | null {
  if (!local) return null;
  const d = new Date(local); // a "YYYY-MM-DDTHH:mm" string is parsed as LOCAL time
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export type LocalFormat = "datetime" | "date" | "time-seconds";

const FORMATTERS: Record<LocalFormat, Intl.DateTimeFormat> = {
  datetime: new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), // 22 Oct 2026, 11:18
  date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }), // 22 Oct 2026
  "time-seconds": new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }), // 11:18:05 (leaderboard tiebreaks, D-059)
};

export function formatLocal(iso: string, format: LocalFormat = "datetime"): string {
  return FORMATTERS[format].format(new Date(iso));
}
