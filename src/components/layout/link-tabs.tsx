import Link from "next/link";
import { cn } from "@/lib/utils";

export type LinkTab = { value: string; label: string; href: string; count?: number };

/**
 * Tabs that are plain links (`?tab=…`), styled like shadcn tabs (D-058). The URL is the state, so reload,
 * back/forward and sharing a link all keep the tab, and the server renders only the active list.
 */
export function LinkTabs({ tabs, active, label }: { tabs: LinkTab[]; active: string; label: string }) {
  return (
    <nav aria-label={label} className="max-w-full overflow-x-auto">
      <ul className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-[3px] text-sm">
        {tabs.map((t) => {
          const current = t.value === active;
          return (
            <li key={t.value} className="h-full">
              <Link href={t.href} scroll={false} aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-full items-center gap-1.5 rounded-md px-3 font-medium whitespace-nowrap transition-colors",
                  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  current ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}>
                {t.label}
                {t.count !== undefined && (
                  <span className={cn("rounded-full px-1.5 text-xs tabular-nums", current ? "bg-muted" : "bg-background/60")}>{t.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
