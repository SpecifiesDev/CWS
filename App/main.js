const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { ipcRenderer } = require('electron');



let mainWindow

let key



function createLoginWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        fullscreen: true,
        // Allow ES6 to be used
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('main.html');

    // Remove nasty bar // util hotkeys
    mainWindow.setMenu(null);

    // I won't document default events as they're very self explanatory
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

}

app.on('ready', createLoginWindow)


app.on('activate', function() {
    if (mainWindow === null) createWindow()
});

// Receive call to quit program from any portion of the loaded window
ipcMain.on('exitProgram()', function() {
    app.quit();
});


// Receive key to set locally in order to be able to send to other loaded windows
ipcMain.on('passKey()', function(event, pkey) {
    console.log("Set global key.");
    let key = pkey;
});

// Receive request to send local key to another loaded window
ipcMain.on('getKey()', function() {
    ipcRenderer.send('sendKey()', key);
});
