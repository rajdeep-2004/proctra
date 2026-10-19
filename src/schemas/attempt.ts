import { z } from "zod";

export const AnswerInput = z.object({
  selectedIndex: z.number().int().min(0).nullable(), // null = clear the answer
  markedForReview: z.boolean(),
});
export type AnswerInput = z.infer<typeof AnswerInput>;
