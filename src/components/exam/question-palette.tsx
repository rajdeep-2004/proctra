"use client";

import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaletteItem = { id: string; answered: boolean; marked: boolean };

/** Grid of question numbers. Filled = answered, outlined = not answered, flag = marked for review. */
export function QuestionPalette({ items, current, onJump }: { items: PaletteItem[]; current: number; onJump: (i: number) => void }) {
  const answered = items.filter((i) => i.answered).length;
  const marked = items.filter((i) => i.marked).length;
  return (
    <nav aria-label="Questions" className="grid gap-4">
      <ol className="grid grid-cols-5 gap-2">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onJump(i)}
              aria-current={i === current ? "step" : undefined}
              aria-label={`Question ${i + 1}, ${item.answered ? "answered" : "not answered"}${item.marked ? ", marked for review" : ""}`}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                item.answered ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
                i === current && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
            >
              {i + 1}
              {item.marked && <Flag className="absolute -top-1.5 -right-1.5 size-4 fill-amber-400 text-amber-600" aria-hidden />}
            </button>
          </li>
        ))}
      </ol>
      <dl className="grid gap-1 text-sm text-muted-foreground">
        <div className="flex justify-between"><dt>Answered</dt><dd>{answered} / {items.length}</dd></div>
        <div className="flex justify-between"><dt>Not answered</dt><dd>{items.length - answered}</dd></div>
        <div className="flex justify-between"><dt>Marked for review</dt><dd>{marked}</dd></div>
      </dl>
    </nav>
  );
}
