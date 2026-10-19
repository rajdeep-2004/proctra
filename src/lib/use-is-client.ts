"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** false during the server render and hydration, true afterwards. For UI that depends on the browser (time zone, storage). */
export function useIsClient(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}
