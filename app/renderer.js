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
const getDraggedFile = (event) => event.dataTransfer.files[0];

var filePath = null;
var originalContent = '';

function renderMarkdownToHtml(markdown) {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

function fileTypeIsSupported(file) {
  return ['text/plain', 'text/markdown'].includes(file.type);
};

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
  mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

revertButton.addEventListener('click', function() {
  markdownView.value = originalContent;
  renderMarkdownToHtml(originalContent);
});

document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

markdownView.addEventListener('dragover', function(event) {

  var file = getDraggedFile(event);
  console.log("___FILE___");
  console.log(file);
  console.log("___DATA TRANSFER___");
  console.log(event.dataTransfer);
  if (fileTypeIsSupported(file)) {
    markdownView.classList.add('drag-over');
  } else {
    markdownView.classList.add('drag-error');
  }
});

markdownView.addEventListener('dragleave', function() {
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('drop', function(event) {
  var file = getDraggedFile(event);
  if (fileTypeIsSupported(file)) {
    mainProcess.openFile(currentWindow, file.path);
  } else {
    alert('File type not supported');
  }
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
});
