"use client";

import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { SnapshotGallery as Gallery } from "@/services/results-service";
import { LocalTime } from "@/components/local-time";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PAGE = 60;

/**
 * Teacher-only gallery (S-01). Nothing loads until asked; links are signed and expire after 10 minutes,
 * so the view offers a refresh instead of keeping stale links.
 */
export function SnapshotGallery({ attemptId, count }: { attemptId: string; count: number }) {
  const [data, setData] = useState<Gallery | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Gallery["snapshots"][number] | null>(null);
  const [expired, setExpired] = useState(false);

  // Flip to "expired" exactly when the signed links stop working.
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => setExpired(true), Math.max(0, Date.parse(data.expiresAt) - Date.now()));
    return () => clearTimeout(t);
  }, [data]);

  async function load() {
    setBusy(true);
    setError(null);
    const res = await api<Gallery>("GET", `/api/v1/teacher/attempts/${attemptId}/snapshots`);
    setBusy(false);
    if (res.ok) {
      setData(res.data);
      setExpired(false);
    }
    else setError(res.error.message);
  }

  if (count === 0) return <p className="text-sm text-muted-foreground">No snapshots were stored.</p>;
  if (!data) {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">{count} stored privately.</p>
        <Button variant="outline" size="sm" onClick={load} disabled={busy}><Camera /> {busy ? "Loading…" : "Show snapshots"}</Button>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">
        Private images. Links expire at <LocalTime iso={data.expiresAt} />.{" "}
        <button type="button" className="underline underline-offset-4" onClick={load}>Refresh links</button>
      </p>
      {expired && <p className="text-sm text-destructive" role="alert">These links have expired — refresh to view again.</p>}
      <ul className="grid grid-cols-3 gap-2">
        {data.snapshots.slice(0, shown).map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => setOpen(s)} className="grid w-full gap-1 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element -- signed, expiring, private URLs: no image optimizer */}
              <img src={s.url} alt={`Snapshot at ${new Date(s.capturedAt).toLocaleTimeString()}`} loading="lazy"
                className="aspect-[4/3] w-full rounded-md border bg-muted object-cover" />
              <LocalTime iso={s.capturedAt} className="text-[10px] tabular-nums text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
      {shown < data.snapshots.length && (
        <Button variant="ghost" size="sm" onClick={() => setShown((n) => n + PAGE)}>
          Show more ({data.snapshots.length - shown} left)
        </Button>
      )}
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Snapshot</DialogTitle>
            <DialogDescription>{open && <LocalTime iso={open.capturedAt} />}</DialogDescription>
          </DialogHeader>
          {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
          {open && <img src={open.url} alt="Snapshot, full size" className="w-full rounded-md border" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
