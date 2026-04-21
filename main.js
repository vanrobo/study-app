import squirrelStartup from "electron-squirrel-startup";
import { app, BrowserWindow, ipcMain } from "electron"; // your existing imports

// If the installer is running, this stops the app from
// launching and lets the installer finish its job (creating shortcuts)
if (squirrelStartup) {
  app.quit();
}

import path from "path"; // <--- THIS LINE IS LIKELY MISSING
import { fileURLToPath } from "url";
import Store from "electron-store";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, "icon.ico"), // ADD THIS LINE
    frame: false, // Frameless
    backgroundColor: "#121212",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");

  // Window Controls
  ipcMain.on("win-min", () => win.minimize());
  ipcMain.on("win-max", () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on("win-close", () => win.close());
}

app.whenReady().then(createWindow);

// --- DATABASE API ---

ipcMain.handle("get-cards", () => store.get("cards") || []);

ipcMain.handle("add-card", (event, card) => {
  const cards = store.get("cards") || [];
  cards.push(card);
  store.set("cards", cards);
  return true;
});

ipcMain.handle("update-card", (event, updatedCard) => {
  const cards = store.get("cards") || [];
  const index = cards.findIndex((c) => c.id === updatedCard.id);
  if (index !== -1) {
    cards[index] = updatedCard;
    store.set("cards", cards);
  }
  return true;
});

ipcMain.handle("delete-card", (event, id) => {
  let cards = store.get("cards") || [];
  cards = cards.filter((c) => c.id !== id);
  store.set("cards", cards);
  return true;
});

ipcMain.handle(
  "get-settings",
  () => store.get("settings") || { theme: "violet" },
);
ipcMain.handle("save-settings", (e, s) => store.set("settings", s));
