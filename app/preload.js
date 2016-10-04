/* global ElectronImplementation:true */

/**
 * Since we've disabled Node integration in the browser window, we must selectively expose
 * main-process/Node modules via this script.
 *
 * @WARNING This file must take care not to leak the imported modules to the browser window!
 * In particular, do not save the following variables as properties of `ElectronImplementation`.
 * See https://github.com/atom/electron/issues/1753#issuecomment-104719851.
 */
const _ = require('lodash');
const { ipcRenderer, remote, shell, desktopCapturer } = require('electron');

/**
 * Defines methods with which to extend the `Electron` module defined in `client.js`.
 * This must be a global in order to escape the preload script and be available to `client.js`.
 */
ElectronImplementation = {
  /**
   * Open the given external protocol URL in the desktop's default manner. (For example, http(s):
   * URLs in the user's default browser.)
   *
   * @param {String} url - The URL to open.
   */
  openExternal: shell.openExternal,

  /**
   * Determines if the browser window is currently in fullscreen mode.
   *
   * "Fullscreen" here refers to the state triggered by toggling the native controls, not that
   * toggled by the HTML API.
   *
   * To detect when the browser window changes fullscreen state, observe the 'enter-full-screen'
   * and 'leave-full-screen' events using `onWindowEvent`.
   *
   * @return {Boolean} `true` if the browser window is in fullscreen mode, `false` otherwise.
   */
  isFullScreen: remote.getCurrentWindow().isFullScreen,

  /**
   * Invokes _callback_ when the specified `BrowserWindow` event is fired.
   *
   * This differs from `onEvent` in that it directs Electron to start emitting the relevant window
   * event.
   *
   * See https://github.com/atom/electron/blob/master/docs/api/browser-window.md#events for a list
   * of events.
   *
   * The implementation of this API, in particular the use of the `ipc` vs. `remote` modules, is
   * designed to avoid memory leaks as described by
   * https://github.com/atom/electron/blob/master/docs/api/remote.md#passing-callbacks-to-the-main-process.
   *
   * @param {String} event - The name of a `BrowserWindow` event.
   * @param {Function} callback - A function to invoke when `event` is triggered. Takes no arguments
   *   and returns no value.
   */
  _windowEventListeners: {},
  onWindowEvent: function onWindowEvent(event, callback) {
    if (!this._windowEventListeners[event]) {
      this._windowEventListeners[event] = [callback];
      ipcRenderer.on(event, (e, from) => {
        if (from === 'observe-window-event') _.invokeMap(this._windowEventListeners[event], 'call', e);
      });
    } else {
      this._windowEventListeners[event].push(callback);
    }
    ipcRenderer.send('observe-window-event', event);
  },

  _webContentEventListeners: {},
  onWebContentEvent: function onWebContentEvent(event, callback) {
    if (!this._webContentEventListeners[event]) {
      this._webContentEventListeners[event] = [callback];
      ipcRenderer.on(event, (e, from) => {
        if (from === 'observe-webContent-event') _.invokeMap(this._webContentEventListeners[event], 'call', e);
      });
    } else {
      this._webContentEventListeners[event].push(callback);
    }
    ipcRenderer.send('observe-webContent-event', event);
  },

  // todo cleanup listeners when the channel is closed

  /**
   * Expose Electrons desktopCapturer API used to enable screen capture.
   */
  desktopCapturer,
  ipcRenderer,
};
