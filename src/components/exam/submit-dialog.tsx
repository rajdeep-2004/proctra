"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = { total: number; answered: number; marked: number; busy: boolean; onConfirm: () => void };

/** Manual submit always asks first and shows what's still open (F-06). */
export function SubmitDialog({ total, answered, marked, busy, onConfirm }: Props) {
  const unanswered = total - answered;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full" disabled={busy}>{busy ? "Submitting…" : "Submit exam"}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit your exam?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="grid gap-2">
              <p>You answered <strong>{answered} of {total}</strong> questions.</p>
              {unanswered > 0 && <p>{unanswered} question{unanswered > 1 ? "s are" : " is"} not answered.</p>}
              {marked > 0 && <p>{marked} question{marked > 1 ? "s are" : " is"} marked for review.</p>}
              <p>You can&apos;t change your answers after submitting.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep working</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
