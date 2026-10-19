import { Badge } from "@/components/ui/badge";
import type { AttemptStatus } from "@/models/attempt";

const STYLES: Record<AttemptStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "In progress", variant: "secondary" },
  submitted: { label: "Submitted", variant: "outline" },
  auto_submitted: { label: "Submitted at time-up", variant: "outline" },
};

export function AttemptStatusBadge({ status }: { status: AttemptStatus }) {
  const s = STYLES[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
