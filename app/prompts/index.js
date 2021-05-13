const electron = require("electron");
const path = require("path");

const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;
const ipcMain = electron.ipcMain || electron.remote.ipcMain;

/**
 *
 * @param {{title:string;message:string;placeholder:string;}} options
 * @returns {Promise<string>}
 */
const prompt = (options) => {
  return new Promise((resolve, reject) => {
    let window = new BrowserWindow({
      title: options.title,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
      frame: false,
      resizable: false,
      width: 250,
      height: 200,
      alwaysOnTop: true,
    });

    window.loadFile(path.join(__dirname, "render.html"));

    const cleanup = () => {
      ipcMain.removeAllListeners("promt-result");
      ipcMain.removeAllListeners("promt-cancel");
      ipcMain.removeAllListeners("prompt-get-data");
      if (window) window.close();
      window = null;
    };

    ipcMain.on("prompt-result", (event, args) => {
      resolve(args);
      cleanup();
    });

    ipcMain.on("prompt-cancel", (event, args) => {
      resolve("");
      cleanup();
    });

    ipcMain.on("prompt-get-data", (event, args) => {
      event.returnValue = JSON.stringify(options);
    });

    window.on("close", () => {
      reject();
    });
  });
};

module.exports = prompt;
