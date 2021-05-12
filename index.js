const electron = require("electron");
const electronStore = require("electron-store");
electronStore.initRenderer();

const store = new electronStore({ name: "main" });

let mainWindow;

const createWindow = () => {
  mainWindow = new electron.BrowserWindow({
    alwaysOnTop: store.has("sticky") ? store.get("sticky") : true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    frame: false,
    height: 200,
    width: 600,
  });
  mainWindow.loadFile("app/index.html");

  electron.ipcMain.on("setSticky", (event, args) => {
    store.set("sticky", args);
  });
  electron.ipcMain.on("getSticky", (event, args) => {
    event.returnValue = store.has("sticky") ? store.get("sticky") : true;
  });
};

electron.app.whenReady().then(() => createWindow());
