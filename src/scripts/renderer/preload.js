const { contextBridge, ipcRenderer, clipboard } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadPage: (page) => ipcRenderer.invoke("load-page", page),
  openExternal: (url) => ipcRenderer.send("open-external", url),
  onAuthSuccess: (callback) =>
    ipcRenderer.on("auth-success", (event, token) => callback(token)),
  onAuthError: (callback) =>
    ipcRenderer.on("auth-error", (event, error) => callback(error)),
  sendNotification: (data) =>
    ipcRenderer.send("show-reminder-notification", data),
  clipboardWriteText: (text) => clipboard.writeText(text),
});
