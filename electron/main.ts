import { app, BrowserWindow, globalShortcut, ipcMain, session, systemPreferences, type IpcMainInvokeEvent } from "electron";
import fs from "node:fs";
import path from "node:path";

const PARTITION = "persist:proctra"; // persistent cookie jar, so sign-in survives restarts

/**
 * URL of the hosted Next.js app.
 * Dev: PROCTRA_APP_URL from .env (or the shell). Packaged: `proctraAppUrl` that electron-builder writes into the
 * app's own package.json (electron-builder.yml → extraMetadata), so the .dmg always talks to production (D-051).
 */
function resolveAppUrl(): URL {
  let raw: string | undefined;
  if (app.isPackaged) {
    const pkg = JSON.parse(fs.readFileSync(path.join(app.getAppPath(), "package.json"), "utf8")) as { proctraAppUrl?: string };
    raw = pkg.proctraAppUrl;
  } else {
    const envFile = path.join(__dirname, "..", "..", ".env");
    if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
    raw = process.env.PROCTRA_APP_URL;
  }
  raw ??= "http://localhost:3000";
  const url = new URL(raw); // throws on a malformed value — better than loading something unexpected
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`PROCTRA_APP_URL must be http(s), got ${url.protocol}`);
  }
  return url;
}

const APP_URL = resolveAppUrl();
const OFFLINE_PAGE = path.join(__dirname, "..", "offline.html");

// Dev-only switches for automated testing (ignored in the packaged app):
//   PROCTRA_FAKE_CAMERA=1 → Chromium's built-in fake camera (no real device, so no macOS camera prompt).
//                           Permission requests still go through our handler below (no auto-accept switch).
//   PROCTRA_KIOSK=0       → exam opens in a normal window instead of taking over the screen
const DEV = !app.isPackaged;
const FAKE_CAMERA = DEV && process.env.PROCTRA_FAKE_CAMERA === "1";
const KIOSK = !(DEV && process.env.PROCTRA_KIOSK === "0");
if (FAKE_CAMERA) {
  app.commandLine.appendSwitch("use-fake-device-for-media-stream");
}

const ATTEMPT_ID = /^[a-f0-9]{24}$/;
/** Dev-only lifecycle log (stdout of `npm run electron`), to debug window handling. */
const trace = (...args: unknown[]) => { if (DEV) console.log("[proctra]", ...args); };

let mainWindow: BrowserWindow | null = null;
let examWindow: BrowserWindow | null = null;
let examAttemptId: string | null = null;

/** Only the app's own origin (and our local offline page) may ever be shown. */
function isAllowedUrl(target: string): boolean {
  try {
    const url = new URL(target);
    if (url.protocol === "file:") return url.pathname === OFFLINE_PAGE;
    return url.origin === APP_URL.origin;
  } catch {
    return false;
  }
}

const isAppOrigin = (u: string | undefined) => {
  try {
    return !!u && new URL(u).origin === APP_URL.origin;
  } catch {
    return false;
  }
};

function hardenSession(): void {
  const ses = session.fromPartition(PARTITION);
  // Only one permission is ever granted: the CAMERA (video, never microphone), and only to our own site.
  ses.setPermissionRequestHandler((_wc, permission, callback, details) => {
    const media = details as { mediaTypes?: string[]; requestingUrl?: string };
    const videoOnly = !!media.mediaTypes?.length && media.mediaTypes.every((t) => t === "video");
    callback(permission === "media" && videoOnly && isAppOrigin(media.requestingUrl));
  });
  ses.setPermissionCheckHandler((_wc, permission, requestingOrigin, details) => {
    const mediaType = (details as { mediaType?: string }).mediaType;
    return permission === "media" && mediaType === "video" && isAppOrigin(requestingOrigin);
  });

  // Chromium writes cookie changes to disk lazily. If the app is force-quit or crashes right after
  // sign-out, the old session cookie would come back on next launch (bad on shared lab Macs).
  // So persist every cookie change promptly (debounced to one write per burst).
  let flushTimer: NodeJS.Timeout | undefined;
  ses.cookies.on("changed", () => {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => void ses.cookies.flushStore(), 200);
  });
}

const webPreferences = {
  preload: path.join(__dirname, "preload.js"),
  partition: PARTITION,
  contextIsolation: true, // page JS can't touch preload/Electron internals
  nodeIntegration: false, // page JS has no Node.js (fs, child_process…)
  sandbox: true, // renderer runs in Chromium's OS-level sandbox
  webviewTag: false,
};

/** Network failure (server down, no internet) → local offline page whose Retry goes back to `retryUrl`. */
function showOfflinePageOnFailure(win: BrowserWindow, retryUrl: () => string) {
  win.webContents.on("did-fail-load", (_event, errorCode, _desc, validatedURL, isMainFrame) => {
    if (!isMainFrame || errorCode === -3 /* ERR_ABORTED: normal for redirects */) return;
    if (validatedURL.startsWith("file:")) return; // never loop on the offline page itself
    void win.loadFile(OFFLINE_PAGE, { query: { retry: retryUrl() } });
  });
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200, height: 800, minWidth: 900, minHeight: 600, title: "Proctra", show: false, webPreferences,
  });
  win.once("ready-to-show", () => win.show());
  showOfflinePageOnFailure(win, () => APP_URL.href);
  win.on("closed", () => {
    trace("main window closed");
    mainWindow = null;
  });
  void win.loadURL(APP_URL.href);
  return win;
}

/**
 * The exam window: kiosk (full screen, no window controls, menu/Dock hidden by macOS presentation mode),
 * can't be closed or minimised by the student. NOT an OS lockdown — Cmd+Q, Force Quit and other devices still
 * work (D-013, PRD non-goals). Quitting just leaves the attempt to be resumed or auto-submitted on the server.
 */
function openExamWindow(attemptId: string) {
  examAttemptId = attemptId;
  const examUrl = new URL(`/exam/${attemptId}`, APP_URL).href;
  examWindow = new BrowserWindow({
    title: "Proctra · Exam",
    show: false,
    kiosk: KIOSK,
    fullscreen: KIOSK,
    width: 1280,
    height: 860,
    closable: false, // only endExam() (or quitting the app) closes it
    minimizable: false,
    alwaysOnTop: KIOSK,
    autoHideMenuBar: true,
    webPreferences,
  });
  if (KIOSK) examWindow.setAlwaysOnTop(true, "screen-saver"); // above other apps' windows
  examWindow.once("ready-to-show", () => {
    examWindow?.show();
    examWindow?.focus();
  });
  showOfflinePageOnFailure(examWindow, () => examUrl);
  // macOS kiosk mode disables the app menu, so the menu's Cmd+Q never fires. An OS-level shortcut, active
  // only while the exam window exists, lets a student always quit. The attempt stays active: resume later,
  // or it auto-submits at the deadline (D-048).
  const quitRegistered = globalShortcut.register("CommandOrControl+Q", () => {
    trace("Cmd+Q during exam → quit");
    app.quit();
  });
  trace("exam Cmd+Q shortcut registered:", quitRegistered);
  const thisWindow = examWindow;
  thisWindow.on("closed", () => {
    trace("exam window closed", { expected: examWindow !== thisWindow });
    if (examWindow !== thisWindow) return; // closed by closeExamWindow(), which reveals the main window itself
    // Closed some other way (crash, OS): forget it and bring the main window back.
    globalShortcut.unregister("CommandOrControl+Q");
    examWindow = null;
    examAttemptId = null;
    mainWindow?.show();
    mainWindow?.focus();
  });
  void examWindow.loadURL(examUrl);
  mainWindow?.hide();
}

/**
 * Ends the exam: leave kiosk/full screen FIRST, wait until macOS has finished leaving the full-screen Space,
 * then destroy the exam window and bring the main window (with the result page) to the front.
 * Doing it all at once left the main window "visible" on a Space that was being torn down — the student
 * saw the app disappear (found in the real kiosk test, D-047).
 */
function closeExamWindow(showUrl: string) {
  trace("closeExamWindow", { hasExam: !!examWindow, hasMain: !!mainWindow, mainVisible: mainWindow?.isVisible() });
  const win = examWindow;
  examWindow = null;
  examAttemptId = null;
  globalShortcut.unregister("CommandOrControl+Q"); // back to the normal menu shortcut
  if (!mainWindow) mainWindow = createMainWindow();
  const main = mainWindow;
  void main.loadURL(showUrl); // result page loads while the exam window is leaving

  const reveal = () => {
    if (main.isDestroyed()) return;
    main.show();
    main.moveTop();
    main.focus();
    app.focus({ steal: true }); // macOS: make Proctra the active app again
    trace("main revealed", { visible: main.isVisible(), focused: main.isFocused() });
  };

  if (!win || win.isDestroyed()) return reveal();

  let finished = false;
  const finish = (why: string) => {
    if (finished) return;
    finished = true;
    trace("exam window leaving done:", why);
    if (!win.isDestroyed()) win.destroy(); // destroy() bypasses closable:false
    setTimeout(reveal, 150); // let macOS settle on the normal desktop Space
  };

  if (win.isKiosk() || win.isFullScreen()) {
    win.once("leave-full-screen", () => finish("leave-full-screen"));
    win.setAlwaysOnTop(false);
    win.setKiosk(false);
    win.setFullScreen(false);
    setTimeout(() => finish("timeout"), 1500); // fallback if macOS sends no event
  } else {
    finish("not fullscreen");
  }
}

// ---------- IPC: the only three things the page can ask for (D-009) ----------

/** IPC must come from our own pages, never from a frame of another origin. */
function fromAppPage(event: IpcMainInvokeEvent) {
  return isAppOrigin(event.senderFrame?.url);
}

ipcMain.handle("proctra:request-camera", async (event) => {
  if (!fromAppPage(event)) return { granted: false, status: "denied" };
  if (FAKE_CAMERA || process.platform !== "darwin") return { granted: true, status: "granted" };
  const status = systemPreferences.getMediaAccessStatus("camera");
  if (status === "granted") return { granted: true, status };
  if (status === "not-determined") {
    const granted = await systemPreferences.askForMediaAccess("camera"); // macOS "allow camera?" prompt
    return { granted, status: granted ? "granted" : "denied" };
  }
  // "denied" / "restricted": macOS won't ask again — the student must enable it in System Settings.
  return { granted: false, status };
});

/**
 * If the main window is in macOS full screen it lives on its own Space. Opening the kiosk window from there left
 * three-finger swipes between Spaces working, so leave full screen first and wait for macOS to finish (D-066).
 */
function leaveFullScreenThen(win: BrowserWindow | null, next: () => void) {
  if (!win || win.isDestroyed() || !win.isFullScreen()) return next();
  let done = false;
  const finish = (why: string) => {
    if (done) return;
    done = true;
    trace("main window left full screen:", why);
    setTimeout(next, 150); // let macOS settle on the normal desktop Space
  };
  win.once("leave-full-screen", () => finish("leave-full-screen"));
  win.setFullScreen(false);
  setTimeout(() => finish("timeout"), 1500); // fallback if macOS sends no event
}

let pendingExamId: string | null = null; // set while waiting for the main window to leave full screen

ipcMain.handle("proctra:start-exam", (event, attemptId: unknown) => {
  if (!fromAppPage(event) || typeof attemptId !== "string" || !ATTEMPT_ID.test(attemptId)) return { ok: false };
  if (pendingExamId) return { ok: pendingExamId === attemptId };
  if (examWindow && !examWindow.isDestroyed()) {
    // Only one exam window at a time; asking again just brings it forward.
    examWindow.focus();
    return { ok: examAttemptId === attemptId };
  }
  pendingExamId = attemptId;
  leaveFullScreenThen(mainWindow, () => {
    pendingExamId = null;
    openExamWindow(attemptId);
  });
  return { ok: true };
});

ipcMain.handle("proctra:end-exam", (event, attemptId: unknown) => {
  if (!fromAppPage(event) || typeof attemptId !== "string" || !ATTEMPT_ID.test(attemptId)) return { ok: false };
  const resultUrl = new URL(`/student/attempts/${attemptId}`, APP_URL).href;
  if (examWindow && examAttemptId !== attemptId) return { ok: false }; // must match the open exam
  closeExamWindow(resultUrl);
  return { ok: true };
});

// ---------- navigation rules for every window ----------

app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, url) => {
    if (!isAllowedUrl(url)) event.preventDefault();
  });
  contents.on("will-redirect", (event, url) => {
    if (!isAllowedUrl(url)) event.preventDefault();
  });
  // No pop-ups or new windows from the page; desktop windows are opened only by main.ts.
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-attach-webview", (event) => event.preventDefault());
});

// One running copy only — a second launch just focuses the existing window.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = examWindow ?? mainWindow;
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  void app.whenReady().then(() => {
    hardenSession();
    mainWindow = createMainWindow();
    app.on("activate", () => {
      if (!mainWindow && !examWindow) mainWindow = createMainWindow();
    });
  });

  // Quit when the last window closes, on macOS too: an exam app shouldn't linger in the dock.
  app.on("window-all-closed", () => {
    trace("window-all-closed → quit");
    app.quit();
  });
  // The exam window is closable:false and in kiosk mode; take it down first so quitting isn't blocked
  // and macOS restores the Dock/menu bar.
  app.on("will-quit", () => globalShortcut.unregisterAll());
  app.on("before-quit", () => {
    trace("before-quit", { examOpen: !!examWindow });
    const win = examWindow;
    examWindow = null;
    examAttemptId = null;
    if (win && !win.isDestroyed()) {
      win.setKiosk(false);
      win.destroy();
    }
  });
}
