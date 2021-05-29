const electron = require("electron");
const electronStore = require("electron-store");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const renderStore = require("./app/data");
const i18n = require("./app/i18n");

electronStore.initRenderer();
const store = new electronStore({ name: "main" });

const app = electron.app;

let languageId = renderStore.langId;
const currentLang = i18n.getLang(languageId);
/** @type {Electron.BrowserWindow} */
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
    show: false,
  });
  mainWindow.loadFile("app/index.html");
  mainWindow.on("ready-to-show", (event) => {
    mainWindow.show();
  });

  electron.ipcMain.on("setSticky", (event, args) => {
    store.set("sticky", args);
  });
  electron.ipcMain.on("getSticky", (event, args) => {
    event.returnValue = store.has("sticky") ? store.get("sticky") : true;
  });

  console.log(languageId);

  autoUpdater.on("update-available", (args) => {
    /** @type {{version:string;releaseName:string;releaseDate:string}} */
    let info = args;
    let notification = new electron.Notification({
      title: currentLang["update {id} found"](info.version),
      body: currentLang["update {id} found, installation after close"](
        info.version
      ),
      icon: path.join(__dirname, "assets", "notification-icon.png"),
    });
    notification.show();

    app.setBadgeCount(1);
  });

  autoUpdater.on("error", (err) => {
    console.error(err);
    let notification = new electron.Notification({
      title: currentLang["error"],
      body: currentLang["error updating"],
      icon: path.join(__dirname, "assets", "notification-icon.png"),
    });
    notification.show();
  });

  autoUpdater.on("download-progress", (progressObj) => {
    /** @type {{bytesPerSecond:number;percent:number;transferred:number;total:number}} */
    const data = progressObj;
    mainWindow.setProgressBar(data.percent / 100.0);
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.setProgressBar(-1);
  });

  autoUpdater.checkForUpdates().catch(console.error);

  electron.ipcMain.on("check-for-updates", (event) => {
    autoUpdater.checkForUpdates();
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
