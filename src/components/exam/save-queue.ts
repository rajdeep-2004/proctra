// Autosave queue for exam answers (D-007). Plain TypeScript — no React — so it can be tested in .scratch/.

export type Answer = { selectedIndex: number | null; markedForReview: boolean };
export type SendResult = "ok" | "closed" | "retry" | "drop";
export type SaveStatus = "saved" | "saving" | "retrying";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type Options = {
  attemptId: string;
  send: (questionId: string, answer: Answer) => Promise<SendResult>;
  storage: KeyValueStore | null; // null if localStorage is unavailable (private mode etc.)
  onStatus?: (s: SaveStatus) => void;
  onClosed?: () => void; // the server says the attempt is over
  backoffMs?: number[]; // retry delays; the last one repeats
};

const sameAnswer = (a: Answer | undefined, b: Answer | undefined) =>
  !!a && !!b && a.selectedIndex === b.selectedIndex && a.markedForReview === b.markedForReview;

/**
 * - Sends ONE request at a time, so an older save can never land after a newer one.
 * - Coalesces: while a save is in flight, further changes to a question just replace its queued value.
 * - Every unconfirmed answer is mirrored to storage, so a reload/crash can replay it ("pending" answers).
 * - Network/server errors retry with backoff; "closed" (attempt ended) stops the queue.
 */
export class SaveQueue {
  private pending = new Map<string, Answer>();
  private inFlight: { questionId: string; answer: Answer } | null = null;
  private failures = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private stopped = false;
  private waiters: (() => void)[] = [];
  private readonly key: string;
  private readonly backoff: number[];

  constructor(private readonly opts: Options) {
    this.key = `proctra:pending:${opts.attemptId}`;
    this.backoff = opts.backoffMs ?? [1000, 2000, 4000, 8000, 10000];
  }

  /** Answers saved locally but not yet confirmed by the server (e.g. from before a crash). */
  loadPending(): Record<string, Answer> {
    try {
      const raw = this.opts.storage?.getItem(this.key);
      return raw ? (JSON.parse(raw) as Record<string, Answer>) : {};
    } catch {
      return {};
    }
  }

  /** Re-queue everything left over from a previous page load. */
  replayPending() {
    for (const [qid, answer] of Object.entries(this.loadPending())) this.pending.set(qid, answer);
    this.persist();
    this.kick();
  }

  enqueue(questionId: string, answer: Answer) {
    if (this.stopped) return;
    this.pending.set(questionId, answer);
    this.persist();
    this.kick();
  }

  get status(): SaveStatus {
    if (this.failures > 0) return "retrying";
    return this.pending.size > 0 || this.inFlight ? "saving" : "saved";
  }

  /** Resolves when everything queued has been confirmed (or the queue stopped / timed out). */
  flush(timeoutMs = 8000): Promise<boolean> {
    if (this.status === "saved" || this.stopped) return Promise.resolve(this.status === "saved");
    return new Promise((resolve) => {
      const t = setTimeout(() => resolve(false), timeoutMs);
      this.waiters.push(() => { clearTimeout(t); resolve(true); });
    });
  }

  /** Call when the browser comes back online: retry now instead of waiting for the backoff. */
  retryNow() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }
    this.kick();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.retryTimer);
  }

  private persist() {
    if (!this.opts.storage) return;
    const unconfirmed: Record<string, Answer> = {};
    if (this.inFlight) unconfirmed[this.inFlight.questionId] = this.inFlight.answer;
    for (const [k, v] of this.pending) unconfirmed[k] = v; // queued value is newer than the in-flight one
    try {
      if (Object.keys(unconfirmed).length) this.opts.storage.setItem(this.key, JSON.stringify(unconfirmed));
      else this.opts.storage.removeItem(this.key);
    } catch {
      // storage full/blocked: saving to the server still works, we just lose the crash backup
    }
  }

  private emit() {
    this.opts.onStatus?.(this.status);
    if (this.status === "saved") this.waiters.splice(0).forEach((w) => w());
  }

  private kick() {
    this.emit();
    if (this.stopped || this.inFlight || this.retryTimer || this.pending.size === 0) return;
    const [questionId, answer] = this.pending.entries().next().value as [string, Answer];
    this.pending.delete(questionId);
    this.inFlight = { questionId, answer };
    this.emit();
    void this.opts.send(questionId, answer).then(
      (result) => this.settle(result),
      () => this.settle("retry"),
    );
  }

  private settle(result: SendResult) {
    const sent = this.inFlight!;
    this.inFlight = null;
    if (result === "closed") {
      this.stop();
      this.emit();
      this.opts.onClosed?.();
      return;
    }
    if (result === "retry") {
      // Put it back unless a newer value for the same question was queued meanwhile.
      if (!this.pending.has(sent.questionId)) {
        this.pending = new Map([[sent.questionId, sent.answer], ...this.pending]);
      }
      const delay = this.backoff[Math.min(this.failures, this.backoff.length - 1)];
      this.failures++;
      this.persist();
      this.emit();
      this.retryTimer = setTimeout(() => {
        this.retryTimer = undefined;
        this.kick();
      }, delay);
      return;
    }
    // "ok" (confirmed) or "drop" (server rejected the value as invalid — retrying can't help)
    this.failures = 0;
    if (sameAnswer(this.pending.get(sent.questionId), sent.answer)) this.pending.delete(sent.questionId);
    this.persist();
    this.kick();
  }
}
