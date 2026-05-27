const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu } = require('electron');
const path = require('path');

let win;

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.workArea;

  const widgetWidth = 150;  
  const widgetHeight = 150; 

  // Start horizontally centered, but safely inside the visible screen bounds (y = 0)
  // to ensure Electron draws the window frame properly.
  const posX = x + (width / 2) - (widgetWidth / 2); 
  const posY = y;    

  win = new BrowserWindow({
    width: widgetWidth,
    height: widgetHeight,
    x: Math.round(posX),
    y: Math.round(posY),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true, 
    enableLargerThanScreen: true, // Crucial: Allows window to move into negative/offscreen Y space
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  //win.webContents.openDevTools({ mode: 'detach' });
  win.loadFile('index.html');

  // Prevent mouse click-blocking on empty transparent pixels
  win.setIgnoreMouseEvents(true, { forward: true });

  // Open DevTools during debugging if your squirrel is completely lost!
  // win.webContents.openDevTools({ mode: 'detach' });

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.quit();
  });
});

// High-precision Window Position Manager
ipcMain.on('move-window', (event, pos) => {
  if (win && !win.isDestroyed()) {
    win.setBounds({
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      width: 150,
      height: 150
    });
  }
});

ipcMain.handle('get-screen-work-area', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return primaryDisplay.workArea;
});

ipcMain.on('set-ignore-mouse', (event, ignore) => {
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(ignore, { forward: ignore });
  }
});

ipcMain.on('show-context-menu', (event) => {
  const template = [
    { label: 'Feed', click: () => { event.sender.send('feed-pet'); } },
    { type: 'separator'},
    { label: 'Kill', click: () => { event.sender.send('kill-pet'); } }
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.on('exit-app', () => {
  app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});