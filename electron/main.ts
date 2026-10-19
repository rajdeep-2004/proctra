import { app, BrowserWindow, session } from "electron";
import fs from "node:fs";
import path from "node:path";

const PARTITION = "persist:proctra"; // persistent cookie jar, so sign-in survives restarts

/** URL of the hosted Next.js app. Dev: from .env. Packaged build: baked in at package time (phase 07). */
function resolveAppUrl(): URL {
  if (!app.isPackaged) {
    const envFile = path.join(__dirname, "..", "..", ".env");
    if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
  }
  const raw = process.env.PROCTRA_APP_URL ?? "http://localhost:3000";
  const url = new URL(raw); // throws on a malformed value — better than loading something unexpected
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`PROCTRA_APP_URL must be http(s), got ${url.protocol}`);
  }
  return url;
}

const APP_URL = resolveAppUrl();
const OFFLINE_PAGE = path.join(__dirname, "..", "offline.html");

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

function hardenSession(): void {
  const ses = session.fromPartition(PARTITION);
  // Deny every permission (camera, notifications, geolocation…) for now.
  // Phase 05 allows "media" (camera) for APP_URL's origin only.
  ses.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  ses.setPermissionCheckHandler(() => false);

  // Chromium writes cookie changes to disk lazily. If the app is force-quit or crashes right after
  // sign-out, the old session cookie would come back on next launch (bad on shared lab Macs).
  // So persist every cookie change promptly (debounced to one write per burst).
  let flushTimer: NodeJS.Timeout | undefined;
  ses.cookies.on("changed", () => {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => void ses.cookies.flushStore(), 200);
  });
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Proctra",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      partition: PARTITION,
      contextIsolation: true, // page JS can't touch preload/Electron internals
      nodeIntegration: false, // page JS has no Node.js (fs, child_process…)
      sandbox: true, // renderer runs in Chromium's OS-level sandbox
      webviewTag: false,
    },
  });

  win.once("ready-to-show", () => win.show());

  // Network failure (server down, no internet) → local offline page with a Retry button.
  win.webContents.on("did-fail-load", (_event, errorCode, _desc, validatedURL, isMainFrame) => {
    if (!isMainFrame || errorCode === -3 /* ERR_ABORTED: normal for redirects */) return;
    if (validatedURL.startsWith("file:")) return; // never loop on the offline page itself
    void win.loadFile(OFFLINE_PAGE, { query: { retry: APP_URL.href } });
  });

  void win.loadURL(APP_URL.href);
  return win;
}

// Apply navigation rules to every web contents (windows created now or later).
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
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  void app.whenReady().then(() => {
    hardenSession();
    createMainWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });

  // Quit when the window closes, on macOS too: an exam app shouldn't linger in the dock.
  app.on("window-all-closed", () => app.quit());
}
