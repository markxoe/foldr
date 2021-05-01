const electron = require("electron");
const electronStore = require("electron-store");
electronStore.initRenderer();

let mainWindow;

const createWindow = () => {
  mainWindow = new electron.BrowserWindow({
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    height: 200,
    width: 600,
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile("index.html");
};

electron.app.whenReady().then(() => createWindow());
