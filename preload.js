const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  min: () => ipcRenderer.send("win-min"),
  max: () => ipcRenderer.send("win-max"),
  close: () => ipcRenderer.send("win-close"),

  getCards: () => ipcRenderer.invoke("get-cards"),
  addCard: (card) => ipcRenderer.invoke("add-card", card),
  updateCard: (card) => ipcRenderer.invoke("update-card", card),
  deleteCard: (id) => ipcRenderer.invoke("delete-card", id),

  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (s) => ipcRenderer.invoke("save-settings", s),
});
