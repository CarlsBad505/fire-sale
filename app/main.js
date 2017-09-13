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
  app.addRecentDocument(file);
  targetWindow.setRepresentedFilename(file);
  targetWindow.webContents.send('file-opened', file, content);
};

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
};

const saveHtml = exports.saveHtml = function(targetWindow, content) {
  var file = dialog.showSaveDialog(targetWindow, {
    title: 'Save HTML',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'HTML Files', extensions: ['html', 'htm'] }
    ]
  });
  if (!file) return;
  fs.writeFileSync(file, content);
};

const saveMarkdown = exports.saveMarkdown = function(targetWindow, file, content) {
  // if (!file) {
  //   file = dialog.showSaveDialog(targetWindow, {
  //     title: 'Save Markdown',
  //     defaultPath: app.getPath('documents'),
  //     filters: [
  //       { name: 'Markdown Files', extensions: ['md', 'markdown'] }
  //     ]
  //   });
  // }
  var file = dialog.showSaveDialog(targetWindow, {
    title: 'Save Markdown',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });
  if (!file) return;
  fs.writeFileSync(file, content);
  openFile(file)
};

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

app.on('will-finish-launching', function() {
  app.on('open-file', function(event, file) {
    var win = createWindow();
    win.once('ready-to-show'), function() {
      openFile(win, file);
    }
  });
});

// Section 6.4
