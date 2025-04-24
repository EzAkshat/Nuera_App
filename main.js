const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const url = require("url");
const { Notification } = require("electron");

let mainWindow;
let pendingToken = null;

// Ensure single instance of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
      const url = commandLine.find((arg) => arg.startsWith('nuera://'));
      if (url) handleDeepLink(url);
    });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, "assets", "nuera-icon.ico"),
      webPreferences: {
        preload: path.join(
          __dirname,
          "src",
          "scripts",
          "renderer",
          "preload.js"
        ),
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    mainWindow.loadFile("index.html");
    mainWindow.on("closed", () => (mainWindow = null));

    app.setAsDefaultProtocolClient("Nuera");

    app.on("open-url", (event, url) => {
      event.preventDefault();
      handleDeepLink(url);
    });
  }

  async function handleDeepLink(deepLink) {
      const urlObj = new URL(deepLink);
      const code = urlObj.searchParams.get('code');
      if (!code) return logger.warn('No code found in deep link');
  
      try {
        const response = await fetch('http://localhost:3000/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (data.token) {
          token = data.token;
          mainWindow.webContents.send('auth-success', token);
        } else {
          mainWindow.webContents.send('auth-error', data.error);
        }
      } catch (err) {
        mainWindow.webContents.send('auth-error', 'Authentication failed');
      }
    }

    app.whenReady().then(createWindow);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

// IPC handler to load HTML pages dynamically
ipcMain.handle("load-page", async (event, page) => {
  const filePath = path.join(__dirname, "src", "components", `${page}.html`);
  console.log("Loading page:", filePath);
  try {
    return await new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  } catch (error) {
    console.error(`Failed to load page ${page}: ${error.message}`);
    return "<p>Error loading page</p>";
  }
});

ipcMain.on("show-reminder-notification", (event, { title, body }) => {
  new Notification({
    title: `Reminder: ${title}`,
    body: body,
  }).show();
});

ipcMain.on("open-external", (event, url) => {
  shell.openExternal(url);
});