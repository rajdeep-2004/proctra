import { Check, CloudOff, Loader2 } from "lucide-react";
import type { SaveStatus } from "@/components/exam/save-queue";

/** Honest save status: "Saved" only when the server has confirmed every answer (D-007). */
export function SaveIndicator({ status }: { status: SaveStatus }) {
  const content = {
    saved: { icon: <Check className="size-4" />, text: "All answers saved", cls: "text-muted-foreground" },
    saving: { icon: <Loader2 className="size-4 animate-spin" />, text: "Saving…", cls: "text-muted-foreground" },
    retrying: { icon: <CloudOff className="size-4" />, text: "Offline — retrying. Your answers are kept on this device.", cls: "text-amber-700 dark:text-amber-400" },
  }[status];
  return (
    <p role="status" aria-live="polite" className={`flex items-center gap-1.5 text-sm ${content.cls}`} data-save-status={status}>
      {content.icon}
      <span>{content.text}</span>
    </p>
  );
}
