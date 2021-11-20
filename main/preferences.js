// Modules to control application life and create native browser window
const {BrowserWindow} = require('electron');
const path = require('path');

async function createPreferencesWindow(globals) {

    const prefWindow = new BrowserWindow({
        title: "Preferences",
        parent: globals.mainWindow,
        frame: true,
        modal: true,
        show: false,
        width: 300,
        height: 300,
        webPreferences: {
           preload: path.join(__dirname, "preload.js")
        }
    })

    console.log(`pref ${globals.config}`)
    await prefWindow.loadFile(path.join(__dirname, 'preferences.html'), {query: globals.config})

    prefWindow.once('ready-to-show', () => {
        prefWindow.show()
        //prefWindow.openDevTools()
    })

    return prefWindow
}

module.exports = createPreferencesWindow;


