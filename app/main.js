const { app, BrowserWindow } = require('electron');

let mainWindow = null;

app.on('ready', function() {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.once('ready-to-show', function() {
    mainWindow.show();
  });
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

// Section 3.4
