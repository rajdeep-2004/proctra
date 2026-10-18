import { contextBridge } from "electron";

// The ONLY desktop API the web page can see (window.proctra). Keep it tiny: each new
// capability is one narrow function that main.ts validates (D-009).
// Phase 05 adds requestCamera / startExam / endExam.
contextBridge.exposeInMainWorld("proctra", {
  isDesktop: true,
});
