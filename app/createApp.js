// Keep a global reference of the window object so that it won't be garbage collected
var mainWindow = null;
var splashScreen = null;

const { app, ipcMain, BrowserWindow } = require('electron'); // Module to control application life.
const path = require('path');
const fs = require('fs');
const proxyWindowEvents = require('./proxyWindowEvents');
const _ = require('lodash');

const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

const windowOptions = _.defaults(settings.windowOptions, {
  title: settings.productName || settings.name,
});

/**
 * Disable Electron's Node integration so that browser dependencies like `moment` will load themselves
 * like normal i.e. into the window rather than into modules, and also to prevent untrusted client
 * code from having access to the process and file system:
 *  - https://github.com/atom/electron/issues/254
 *  - https://github.com/atom/electron/issues/1753
 */
_.set(windowOptions, 'webPreferences.nodeIntegration', false);
_.set(windowOptions, 'webPreferences.preload', path.join(__dirname, 'preload.js'));

const createMain = () => {
  if (mainWindow) return;
  // Create the browser window.
  const options = Object.assign(windowOptions, { show: false });
  mainWindow = new BrowserWindow(options);
  proxyWindowEvents(mainWindow);
  if (settings.maximize) mainWindow.maximize();

  // Hide the main window instead of closing it, so that we can bring it back more quickly.
  const hideInsteadofClose = e => {
    mainWindow.hide();
    e.preventDefault();
  };
  mainWindow.on('close', hideInsteadofClose);

  app.on('activate', () => {
    // Show the main window when the customer clicks on the app icon.
    if (!mainWindow.isVisible()) mainWindow.show();
  });

  app.on('before-quit', () => {
    // We need to remove our close event handler from the main window,
    // otherwise the app will not quit.
    mainWindow.removeListener('close', hideInsteadofClose);
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
};

const createSplashScreen = (show) => new Promise(resolve => {
  if (splashScreen) {
    if (show) splashScreen.show();
    resolve();
  } else {
    const options = Object.assign(windowOptions, mainWindow.getBounds(), { parent: mainWindow, show: false });
    splashScreen = new BrowserWindow(options);
    splashScreen.webContents.once('did-finish-load', () => {
      if (show) splashScreen.show();
      resolve();
    });
    splashScreen.on('closed', () => {
      splashScreen = null;
    });
    splashScreen.loadURL(`file://${__dirname}/loading.html`);
  }
});

const loadURL = () => new Promise((resolve, reject) => {
  var hasError = false;

  mainWindow.webContents.once('did-start-loading', () => {
    if (splashScreen) splashScreen.webContents.send('did-start-loading');
  });

  mainWindow.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
    // redirect responses will emit errorCode -3, we do not need to handle this as an error
    if (errorCode && errorCode !== -3) {
      hasError = true;
      if (splashScreen) splashScreen.webContents.send('did-fail-load', errorCode, errorDescription);
      reject({ errorCode, errorDescription });
    } else {
      resolve();
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    if (!hasError) {
      if (splashScreen) splashScreen.webContents.send('did-finish-load');
      resolve();
    }
  });

  mainWindow.loadURL(settings.rootUrl);
});

function reload(show) {
  createSplashScreen(show)
    .then(loadURL)
    .then(
      () => {
        mainWindow.show();
        splashScreen.close();
      },
      ({ errorCode, errorDescription }) => {
        console.error(`could not connect: ${errorCode}: ${errorDescription}`);
      }
    );
}

function create() {
  createMain();
  ipcMain.on('reload', () => reload());
  createSplashScreen(true)
    .then(loadURL)
    .then(
      () => {
        mainWindow.show();
        splashScreen.close();
      },
      ({ errorCode, errorDescription }) => {
        console.error(`could not connect: ${errorCode}: ${errorDescription}`);
      }
    );
}
module.exports = {
  getMainWindow: () => mainWindow,
  create,
  reload,
};
