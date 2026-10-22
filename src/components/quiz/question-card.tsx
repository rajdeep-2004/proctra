"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionState } from "@/components/quiz/editor-types";

const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

type Props = {
  index: number;
  total: number;
  question: QuestionState;
  errors: Record<string, string>; // keyed by full path, e.g. "questions.2.options.1"
  disabled: boolean;
  onChange: (q: QuestionState) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
};

export function QuestionCard({ index, total, question: q, errors, disabled, onChange, onMove, onRemove }: Props) {
  const err = (sub: string) => errors[`questions.${index}${sub}`];
  const textId = `q-${q.key}-text`;

  const setOption = (i: number, value: string) => onChange({ ...q, options: q.options.map((o, j) => (j === i ? value : o)) });
  const removeOption = (i: number) => {
    const options = q.options.filter((_, j) => j !== i);
    // keep the correct answer pointing at the same option after removal
    const correctIndex = q.correctIndex === null || q.correctIndex === i ? null : q.correctIndex > i ? q.correctIndex - 1 : q.correctIndex;
    onChange({ ...q, options, correctIndex });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Question {index + 1}</CardTitle>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon" disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label={`Move question ${index + 1} up`}>
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled={disabled || index === total - 1} onClick={() => onMove(1)} aria-label={`Move question ${index + 1} down`}>
            <ArrowDown />
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={onRemove} aria-label={`Delete question ${index + 1}`}>
            <Trash2 />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={textId}>Question text</Label>
          <Textarea id={textId} value={q.text} disabled={disabled} rows={2} aria-invalid={Boolean(err(".text"))}
            onChange={(e) => onChange({ ...q, text: e.target.value })} />
          {err(".text") && <p className="text-sm text-destructive">{err(".text")}</p>}
        </div>

        <fieldset className="grid gap-2" disabled={disabled}>
          <legend className="mb-2 text-sm font-medium">Options (select the correct one)</legend>
          <RadioGroup value={q.correctIndex === null ? "" : String(q.correctIndex)} onValueChange={(v) => onChange({ ...q, correctIndex: Number(v) })}
            className="grid gap-2" aria-label={`Correct option for question ${index + 1}`}>
            {q.options.map((opt, i) => (
              <div key={i} className="grid gap-1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={String(i)} id={`q-${q.key}-correct-${i}`} aria-label={`Option ${i + 1} is correct`} disabled={disabled} />
                  <Input value={opt} placeholder={`Option ${i + 1}`} disabled={disabled} aria-label={`Option ${i + 1}`}
                    aria-invalid={Boolean(err(`.options.${i}`))} onChange={(e) => setOption(i, e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" disabled={disabled || q.options.length <= MIN_OPTIONS}
                    onClick={() => removeOption(i)} aria-label={`Remove option ${i + 1}`}>
                    <X />
                  </Button>
                </div>
                {err(`.options.${i}`) && <p className="pl-6 text-sm text-destructive">{err(`.options.${i}`)}</p>}
              </div>
            ))}
          </RadioGroup>
          {err(".options") && <p className="text-sm text-destructive">{err(".options")}</p>}
          {err(".correctIndex") && <p className="text-sm text-destructive">{err(".correctIndex")}</p>}
          <div>
            <Button type="button" variant="outline" size="sm" disabled={disabled || q.options.length >= MAX_OPTIONS}
              onClick={() => onChange({ ...q, options: [...q.options, ""] })}>
              <Plus /> Add option
            </Button>
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
