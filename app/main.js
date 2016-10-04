/* eslint-disable no-console */
const { app, autoUpdater } = require('electron'); // Module to control application life.
const path = require('path');
const fs = require('fs');
const os = require('os');
const handleStartupEvent = require('./winSquirrelStartupEventHandler');
const createDefaultMenu = require('./menu.js');
const { create } = require('./createApp.js');

const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const feedURL = settings.feedURL;
const updateURL = `${feedURL}/update/${os.platform()}_${os.arch()}/${app.getVersion()}`;

// check if we are in a squirrel update process and interrupt in case
if (handleStartupEvent()) return;

if (updateURL && (process.platform === 'darwin' || process.platform === 'win32')) autoUpdater.setFeedURL(updateURL);

app.once('ready', create);
