const _ = require('lodash');
const { ipcMain } = require('electron');

/**
 * Proxies `BrowserWindow` events to renderer processes as directed by those processes and in a way
 * that avoids memory leaks.
 *
 * For each event that the renderer process wishes to observe, it should send the 'onWindowEvent'
 * message with the event name as argument:
 *
 *   require('electron').ipcRenderer.send('onWindowEvent', 'enter-full-screen')
 *
 * The renderer process will then receive the 'triggerWindowEvent' message when the event occurs:
 *
 *   require('electron').ipcRenderer.on('triggerWindowEvent', function(event, arg) {
 *     console.log(arg); // prints 'enter-full-screen'
 *   });
 *
 * This module, in particular the use of the `ipc` vs. `remote` module, is motivated by
 * https://github.com/atom/electron/blob/master/docs/api/remote.md#passing-callbacks-to-the-main-process.
 *
 * @param {BrowserWindow} window - The window whose events to proxy.
 */
const proxyWindowEvents = window => {
  var windowEventsObserved = {};
  var webContentEventsObserved = {};

  ipcMain.on('observe-window-event', (event, arg) => {
    if (event.sender === window.webContents && !windowEventsObserved[arg]) {
      windowEventsObserved[arg] = () => window.webContents.send(arg, 'observe-window-event');
      window.on(arg, () => windowEventsObserved[arg]);
    }
  });

  ipcMain.on('observe-webContent-event', (event, arg) => {
    if (event.sender === window.webContents && !webContentEventsObserved[arg]) {
      webContentEventsObserved[arg] = () => window.webContents.send(arg, 'observe-webContent-event');
      window.webContents.on(arg, webContentEventsObserved[arg]);
    }
  });

  // Clear our listeners when the page starts (re)loading i.e. its listeners have been purged.
  // TODO(wearhere): I'm not sure this is the right event for reload but it seems to work.
  window.webContents.on('did-start-loading', () => {
    _.forEach(windowEventsObserved, (listener, event) => {
      window.removeListener(event, listener);
    });
    _.forEach(webContentEventsObserved, (listener, event) => {
      window.webContents.removeListener(event, listener);
    });
    windowEventsObserved = {};
    webContentEventsObserved = {};
  });
};

module.exports = proxyWindowEvents;
