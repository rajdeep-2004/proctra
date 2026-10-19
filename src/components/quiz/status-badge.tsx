import { Badge } from "@/components/ui/badge";

const STYLES = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STYLES }) {
  const s = STYLES[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
