const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

let mainWindow = null;

const getFileFromUser = exports.getFileFromUser = function() {
  var files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });
  if (files) { openFile(files[0]) }
};

const openFile = function(file) {
  var content = fs.readFileSync(file).toString();
  mainWindow.webContents.send('file-opened', file, content);
}

app.on('ready', function() {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.once('ready-to-show', function() {
    mainWindow.show();
    getFileFromUser();
  });
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

// Section 5
