const { Menu, BrowserWindow, app, autoUpdater } = require('electron');
const AppUpdater = require('./AppUpdater');
const { reload } = require('./createApp.js');

app.once('ready', function() {

  const template = [
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click() {
            reload();
          },
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    });

    if (autoUpdater.getFeedURL()) {
      // Add 'Check for Updates' below the 'About' menu item.
      template[0].submenu.splice(1, 0, {
        label: 'Check for Updates',
        click: () => AppUpdater.checkForUpdates(true),
      });
    }

    // Edit menu.
    template[1].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Speech',
        submenu: [
          {
            role: 'startspeaking'
          },
          {
            role: 'stopspeaking'
          }
        ]
      }
    );
    // Window menu.
    template[3].submenu = [
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Zoom',
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    ]
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

// , () => AppUpdater.checkForUpdates(true)
/**
 * Creates a default menu. Modeled after https://github.com/atom/electron/pull/1863, augmented with
 * the roles from https://github.com/atom/electron/blob/master/docs/api/menu.md.
 */
const createDefaultMenu = function(app, getMainWindow, checkForUpdates) {
  app.once('ready', function() {
    var template;
    if (process.platform == 'darwin') {
      template = [
        {
          label: app.getName(),
          submenu: [
            {
              label: 'About ' + app.getName(),
              role: 'about',
            },
            {
              type: 'separator'
            },
            {
              label: 'Services',
              role: 'services',
              submenu: []
            },
            {
              type: 'separator'
            },
            {
              label: 'Hide ' + app.getName(),
              accelerator: 'Command+H',
              role: 'hide'
            },
            {
              label: 'Hide Others',
              accelerator: 'Command+Shift+H',
              role: 'hideothers'
            },
            {
              label: 'Show All',
              role: 'unhide'
            },
            {
              type: 'separator'
            },
            {
              label: 'Quit',
              accelerator: 'Command+Q',
              click: function() { app.quit(); }
            },
          ]
        },
        {
          label: 'File',
          submenu: [
            {
              label: 'Refresh',
              accelerator: 'Command+R',
              click: function() {
                var focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                  focusedWindow.reload();
                }
              }
            },
            {
              label: 'Close',
              accelerator: 'Command+W',
              role: 'close'
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              accelerator: 'Command+Z',
              role: 'undo'
            },
            {
              label: 'Redo',
              accelerator: 'Shift+Command+Z',
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              label: 'Cut',
              accelerator: 'Command+X',
              role: 'cut'
            },
            {
              label: 'Copy',
              accelerator: 'Command+C',
              role: 'copy'
            },
            {
              label: 'Paste',
              accelerator: 'Command+V',
              role: 'paste'
            },
            {
              label: 'Select All',
              accelerator: 'Command+A',
              role: 'selectall'
            },
          ]
        },
        {
          label: 'Window',
          submenu: [
            {
              label: 'Minimize',
              accelerator: 'Command+M',
              role: 'minimize'
            },
            {
              label: 'Toggle Full Screen',
              accelerator: 'Ctrl+Command+F',
              click: function() {
                var focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                  focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Main Window',
              accelerator: 'Command+1',
              click: function() {
                var mainWindow = getMainWindow();
                if (mainWindow) {
                  mainWindow.show();
                }
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Bring All to Front',
              role: 'front'
            },
          ]
        }
      ];

      if (checkForUpdates) {
        // Add 'Check for Updates' below the 'About' menu item.
        template[0].submenu.splice(1, 0, {
          label: 'Check for Updates',
          click: checkForUpdates
        });
      }
    } else {
      template = [
        {
          label: '&File',
          submenu: [
            {
              label: '&Open',
              accelerator: 'Ctrl+O',
            },
            {
              label: '&Refresh',
              accelerator: 'Ctrl+R',
              click: function() {
                var focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                  focusedWindow.reload();
                }
              }
            },
            {
              label: '&Close',
              accelerator: 'Ctrl+W',
              click: function() {
                var focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                  focusedWindow.close();
                }
              }
            },
          ]
        },
        {
          label: '&Window',
          submenu: [
            {
              label: 'Toggle &Full Screen',
              accelerator: 'F11',
              click: function() {
                var focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                  focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
              }
            }
          ]
        }
      ];

      if (checkForUpdates) {
        // Add a separator and 'Check for Updates' at the bottom of the 'File' menu.
        template[0].submenu.push({
          type: 'separator'
        }, {
          label: '&Check for Updates',
          click: checkForUpdates
        });
      }
    }

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  });
};

module.exports = createDefaultMenu;
