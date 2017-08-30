const marked = require('marked');
const path = require('path');
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

var filePath = null;
var originalContent = '';

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

const updateUserInterface = function(isEdited) {
  let title = 'Fire Sale';
  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`;
  }
  if (isEdited) {
    title = `${title} (Edited)`;
  }
  currentWindow.setTitle(title);
  currentWindow.setDocumentEdited(isEdited);
  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;
};

markdownView.addEventListener('keyup', function(event) {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updateUserInterface(currentContent !== originalContent)
});

openFileButton.addEventListener('click', function() {
  mainProcess.getFileFromUser(currentWindow);
});

ipcRenderer.on('file-opened', function(event, file, content) {
  filePath = file;
  originalContent = content;
  markdownView.value = content;
  renderMarkdownToHtml(content);
  updateUserInterface();
});

newFileButton.addEventListener('click', function() {
  mainProcess.createWindow();
});

saveHtmlButton.addEventListener('click', function() {
  mainProcess.saveHtml(currentWindow, htmlView.innerHTML);
});

saveMarkdownButton.addEventListener('click', function() {
  console.log('HERE')
  console.log(filePath);
  console.log(typeof filePath);
  mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

revertButton.addEventListener('click', function() {
  markdownView.value = originalContent;
  renderMarkdownToHtml(originalContent);
});
