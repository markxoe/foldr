const electron = require("electron");
const electronStore = require("electron-store");
const path = require("path");
const { autoUpdater } = require("electron-updater");
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
    minHeight: 100,
    minWidth: 300,
  });
  mainWindow.loadFile("app/index.html");

  electron.ipcMain.on("setSticky", (event, args) => {
    store.set("sticky", args);
  });
  electron.ipcMain.on("getSticky", (event, args) => {
    event.returnValue = store.has("sticky") ? store.get("sticky") : true;
  });

  autoUpdater.on("update-available", (args) => {
    /** @type {{version:string;releaseName:string;releaseDate:string}} */
    let info = args;
    let notification = new electron.Notification({
      title: `Update ${info.version} gefunden`,
      body: `Update ${info.version} gefunden und heruntergeladen, wird nach dem nächsten Schließen automatisch installiert`,
      icon: path.join(__dirname, "assets", "notification-icon.png"),
    });

    notification.show();

    electron.app.setBadgeCount(1);
  });

  autoUpdater.on("error", (err) => {
    console.error(err);
    let notification = new electron.Notification({
      title: `Fehler`,
      body: `Fehler beim herunterladen von Updates`,
      icon: path.join(__dirname, "assets", "notification-icon.png"),
    });

    notification.show();
  });

  autoUpdater.checkForUpdates().catch(console.error);
};

electron.app.whenReady().then(() => createWindow());
