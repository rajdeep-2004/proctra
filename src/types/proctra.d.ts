// Shape of the API exposed by electron/preload.ts. Undefined when running in a normal browser.
export interface ProctraDesktopApi {
  isDesktop: true;
}

declare global {
  interface Window {
    proctra?: ProctraDesktopApi;
  }
}
