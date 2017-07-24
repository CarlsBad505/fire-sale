const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const windows = new Set();

let mainWindow = null;

const getFileFromUser = exports.getFileFromUser = function(targetWindow) {
  var files = dialog.showOpenDialog(targetWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });
  if (files) { openFile(targetWindow, files[0]); }
};

const openFile = exports.openFile = function(targetWindow, file) {
  var content = fs.readFileSync(file).toString();
  targetWindow.webContents.send('file-opened', file, content);
}

const createWindow = exports.createWindow = function() {
  let x, y;
  var currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    var [ currentWindowX, currentWindowY ] = currentWindow.getPosition();
    x = currentWindowX + 10;
    y = currentWindowY + 10;
  }
  let newWindow = new BrowserWindow({ x, y, show: false });
  // windows.add(newWindow);
  newWindow.loadURL(`file://${__dirname}/index.html`);
  newWindow.once('ready-to-show', function() {
    newWindow.show();
  });
  newWindow.on('closed', function() {
    windows.delete(newWindow);
    newWindow = null;
  });
  return newWindow;
}

app.on('ready', function() {
  createWindow();
});

app.on('window-all-closed', function() {
  if (process.platform === 'darwin') {
    return false;
  }
});

app.on('activate', function(event, hasVisibleWindows) {
  if (!hasVisibleWindows) { createWindow(); }
});

// Section 6
