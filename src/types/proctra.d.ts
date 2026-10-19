// Shape of the API exposed by electron/preload.ts. Undefined when running in a normal browser.
export interface ProctraDesktopApi {
  isDesktop: true;
  requestCamera(): Promise<{ granted: boolean; status: string }>;
  startExam(attemptId: string): Promise<{ ok: boolean }>;
  endExam(attemptId: string): Promise<{ ok: boolean }>;
}

declare global {
  interface Window {
    proctra?: ProctraDesktopApi;
  }
}
