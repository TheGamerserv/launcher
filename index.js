const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const { Client, Authenticator } = require("minecraft-launcher-core");
const launcher = new Client();
const request = require("request");
const fs = require("fs");
const {autoUpdater} = require ('electron-updater');
const { prototype } = require("stream");
const { url } = require("inspector");
let appdata = app.getPath("appData");
//const cpd_client = require('cpd_client')

let mainWindow;

function createWindow() {

  /* appWindow = new BrowserWindow({
    //frame: false,
    title: "The Gamer serv",
    icon: path.join(__dirname, "/asset/icon.ico"),
    width: 1250,
    height: 700,
    minWidth: 1250,
    minHeight: 700,
    maxWidth: 1250,
    maxHeight: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  appWindow.setMenu(null);
  appWindow.loadURL(path.join(__dirname, "index.html")); */



   mainWindow = new BrowserWindow({
    frame: false,
    title: "The Gamer serv",
    icon: path.join(__dirname, "/asset/icon.ico"),
    width: 350,
    height: 500,
    minWidth: 350,
    minHeight: 500,
    maxWidth: 350,
    maxHeight: 500,
    movable: true,
    webPreferences: {
      nodeIntegration: true,
      slashes: true,
    },
  });
  mainWindow.setMenu(null);
  mainWindow.loadURL(path.join(__dirname, "update.html"));
 

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
  mainWindow.loadURL(path.join(__dirname, "update_down.html"));
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
  autoUpdater.quitAndInstall();
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

 ipcMain.on('login',(evt,data)=>{
  //*evt.sender.send('err', 'Services Indisponible');
 Authenticator.getAuth(data.user, data.pass)
    .then((user) => {
      appWindow.loadFile(path.join(__dirname, 'app-dev.html')).then(() => {
        appWindow.webContents.send('user', user);
        console.log('Pseudo : ' + user.name)
      })
    })
  .catch(() => {
  evt.sender.send('err', 'Mauvais identifiants');
 });
}); 

autoUpdater.on('update-not-available', () => {
appWindow = new BrowserWindow({
    //frame: false,
    title: "The Gamer serv",
    icon: path.join(__dirname, "/asset/icon.ico"),
    width: 1250,
    height: 700,
    minWidth: 1250,
    minHeight: 700,
    maxWidth: 1250,
    maxHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule:true,
    },
  });
  appWindow.setMenu(null);
  appWindow.loadURL(path.join(__dirname, "index.html"));
  mainWindow.destroy();
});


ipcMain.on("play", (event, data) => {
  event.sender.send("done");
  let opts = {
    clientPackage: "https://www.dropbox.com/s/b6uzhn58qedvpbt/m.zip?dl=1", 
    authorization: Authenticator.refreshAuth(data.access_token, data.client_token),
    root: path.join(app.getPath("appData"), "/.thegamerserv/shadowpix"),
    version: {
        number: "1.12.2",
        type: "release"
    },
    forge: appdata + "/.thegamerserv/shadowpix/forge-1.12.2.jar",
      memory: {
        max: "4048M",
        min: "1024M"
    }
  }

  // Lancement du jeu
  //cpd_client.start(false, path.join(app.getPath("appData"), "/.thegamerserv/"));
  launcher.launch(opts);

  // Progression
  launcher.on('debug', (e) => console.log(e));
  launcher.on('progress', (e) => {
    appWindow.webContents.send("download");
    event.sender.send("progression", e);
  });
  launcher.on('launch', (e) => {
    event.sender.send("launchgame", e)
  })
});

ipcMain.on('loginToken', (evt, data) => {
  Authenticator.refreshAuth(data.access_token, data.client_token)
    .then((user) => {
      appWindow.loadFile(path.join(__dirname, 'app-dev.html')).then(() => {
        appWindow.webContents.send('user', user);
        console.log('Pseudo : ' + user.name)
      });
    })
    .catch(() => {
      evt.sender.send('err', 'Tokens expirés');
    });
});