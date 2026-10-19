import { Badge } from "@/components/ui/badge";
import type { Availability } from "@/services/quiz-service";

const STYLES: Record<Availability, { label: string; variant: "default" | "secondary" | "outline" }> = {
  open: { label: "Open now", variant: "default" },
  upcoming: { label: "Upcoming", variant: "secondary" },
  closed: { label: "Closed", variant: "outline" },
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const s = STYLES[availability];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
