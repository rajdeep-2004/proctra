// Pure scoring logic (no DB, no "server-only") so it can be checked by hand in .scratch/ (D-024).

export type Marking = { correct: number; incorrect: number; unanswered: number };
export type GradableQuestion = { id: string; correctIndex: number };
export type GradableAnswers = Record<string, { selectedIndex: number | null } | undefined>;
export type Score = { total: number; correct: number; incorrect: number; unanswered: number; maxPossible: number };
export type QuestionResult = "correct" | "incorrect" | "unanswered";

/** Rounds to 2 decimals so fractional marks don't show float noise (0.1 + 0.2 → 0.3). */
const round2 = (n: number) => Math.round(n * 100) / 100;

export function resultFor(q: GradableQuestion, answers: GradableAnswers): QuestionResult {
  const selected = answers[q.id]?.selectedIndex;
  if (selected === null || selected === undefined) return "unanswered";
  return selected === q.correctIndex ? "correct" : "incorrect";
}

/**
 * total = correct × marking.correct + incorrect × marking.incorrect + unanswered × marking.unanswered.
 * Only the quiz's own questions count; answers for unknown ids are ignored.
 */
export function grade(questions: GradableQuestion[], marking: Marking, answers: GradableAnswers): Score {
  let correct = 0, incorrect = 0, unanswered = 0;
  for (const q of questions) {
    const r = resultFor(q, answers);
    if (r === "correct") correct++;
    else if (r === "incorrect") incorrect++;
    else unanswered++;
  }
  return {
    total: round2(correct * marking.correct + incorrect * marking.incorrect + unanswered * marking.unanswered),
    correct,
    incorrect,
    unanswered,
    maxPossible: round2(questions.length * marking.correct),
  };
}
