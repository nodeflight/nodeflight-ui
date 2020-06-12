import path from "path";
import { app, crashReporter, BrowserWindow } from "electron";

import { serial_init } from "./serial";
import { ipcMain as ipc } from "electron";

crashReporter.start({
  companyName: "NodeFlight",
  submitURL: "https://github.com/nodeflight/nodeflight-ui/issues",
});

const is_dev = process.env.NODE_ENV === "development";
var mainWindow = null;

app.allowRendererProcessReuse = true;

app.on("window-all-closed", () => {
  /* One app - one window, ignore macOS convention */
  app.quit();
});

app.on("ready", async () => {
  if (is_dev) {
    try {
      const installer = require("electron-devtools-installer");
      await installer.default(
        "REACT_DEVELOPER_TOOLS",
        !!process.env.UPGRADE_EXTENSIONS
      );
      await installer.default(
        "REDUX_DEVTOOLS",
        !!process.env.UPGRADE_EXTENSIONS
      );
    } catch (e) {
      console.log("Error installing extensions");
      console.log(e);
    }
  }

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile(__dirname + "/../app/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;

    /* One app - one window, ignore macOS convention */
    app.quit();
  });

  if (is_dev) {
    mainWindow.webContents.on("did-frame-finish-load", () => {
      mainWindow.webContents.openDevTools();
    });
  }

  serial_init(ipc, mainWindow);
});
