const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js');
const currentWindow = remote.getCurrentWindow();
const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

function renderMarkdownToHtml(markdown) {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
}

const createWindow = exports.createWindow = function() {
  let x, y;
  var currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    var [ currentWindowX, currentWindowY ] = currentWindow.getPosition();
    x = currentWindowX + 10;
    y = currentWindowY + 10;
  }
  var newWindow = new BrowserWindow({ x, y, show: false });
  newWindow.once('ready-to-show', function() {
    newWindow.show();
  });
  newWindow.on('closed', function() {
    windows.delete(newWindow);
    newWindow = null;
  });
  return newWindow;
};

markdownView.addEventListener('keyup', function(event) {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
});

openFileButton.addEventListener('click', function() {
  mainProcess.getFileFromUser(currentWindow);
});

ipcRenderer.on('file-opened', function(event, file, content) {
  markdownView.value = content;
  renderMarkdownToHtml(content);
});

newFileButton.addEventListener('click', function(){
  mainProcess.createWindow();
});
