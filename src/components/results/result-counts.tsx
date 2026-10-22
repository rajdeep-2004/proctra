import { Check, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** "✓ 3 correct · ✗ 1 wrong · – 1 unanswered" as tags. Icons + words, never colour alone. */
export function ResultCounts({ correct, incorrect, unanswered }: { correct: number; incorrect: number; unanswered: number }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Answer breakdown">
      <li><Badge variant="outline" className="gap-1 border-green-600/40 text-green-700 dark:text-green-400"><Check aria-hidden />{correct} correct</Badge></li>
      <li><Badge variant="outline" className="gap-1 border-destructive/40 text-destructive"><X aria-hidden />{incorrect} wrong</Badge></li>
      <li><Badge variant="outline" className="gap-1 text-muted-foreground"><Minus aria-hidden />{unanswered} unanswered</Badge></li>
    </ul>
  );
}
