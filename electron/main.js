const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        fullscreen: true,
        fullscreenable: true,
        autoHideMenuBar: true,
        backgroundColor: '#0a0a1a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../public/icon.png'),
    });

    // In production, load from dist folder
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        mainWindow.loadURL('http://localhost:3000');
    }

    // Remove menu bar
    Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Toggle fullscreen with F11
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F11') {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
