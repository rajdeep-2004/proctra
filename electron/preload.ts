import { contextBridge, ipcRenderer } from "electron";

// The ONLY desktop API the web page can see (window.proctra). Each function maps to one fixed IPC
// channel; main.ts validates every argument and checks the request comes from our own site (D-009).
contextBridge.exposeInMainWorld("proctra", {
  isDesktop: true,
  /** macOS camera permission for the app. */
  requestCamera: (): Promise<{ granted: boolean; status: string }> => ipcRenderer.invoke("proctra:request-camera"),
  /** Open the kiosk exam window for this attempt and hide the main window. */
  startExam: (attemptId: string): Promise<{ ok: boolean }> => ipcRenderer.invoke("proctra:start-exam", attemptId),
  /** Close the exam window and show this attempt's result in the main window. */
  endExam: (attemptId: string): Promise<{ ok: boolean }> => ipcRenderer.invoke("proctra:end-exam", attemptId),
});
