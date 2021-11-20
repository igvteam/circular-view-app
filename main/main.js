// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const fs = require('fs')
const path = require('path')
const createMenu = require('./menu.js')
const {startServer} = require('./server.js')
const sendToIGV = require('./toigv.js')

const configDefaults = {
    port: 1234,
    igvHost: "localhost",
    igvPort: 60151
}

const globals = {};

(async () => {
    await app.whenReady()
    globals.config = Object.assign({}, configDefaults)
    try {
        const overrides = require(path.join(app.getPath('userData'), 'config.json'))
        console.log(overrides)
        Object.assign(globals.config, overrides)
    } catch (e) {
        // config file does not exist unless preferences has been edited
    }
    globals.mainWindow = await createMainWindow()
    Menu.setApplicationMenu(createMenu(globals))

})()


async function createMainWindow() {

    const mainWindow = new BrowserWindow({
        title: "IGV",
        show: false,
        width: 600,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        globals.mainWindow = undefined
    })

    const appPath = app.getAppPath()
    await mainWindow.loadFile(path.join(appPath, 'index.html'))

    if (!globals.server) {
        globals.server = startServer(mainWindow, globals.config.port)
    }

    return mainWindow
}


app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('toIGV', (event, msg) => {
    console.log(msg) // msg from web page
    sendToIGV(msg, globals.config.igvHost, globals.config.igvPort)
})

ipcMain.on('preferences', (event, msg) => {

    // The preferences window is Modal, so it will be in focus.
    BrowserWindow.getFocusedWindow().hide()

    const json = JSON.parse(msg)
    if(json.hasOwnProperty('port') && json.hasOwnProperty('igvHost') && json.hasOwnProperty('igvPort')) {
        if (json.port && json.port !== globals.config.port) {
            if (globals.server) {
                globals.server.close()
            }
            startServer(globals.mainWindow, json.port)
        }
        Object.assign(globals.config, json)
        writeConfig(globals.config)
        console.log(globals.config)
    }
})

function writeConfig(config) {
    const p = `${app.getPath('userData')}/config.json`
    console.log("Writing config to " + p)
    fs.writeFile(p, JSON.stringify(config), err => console.error(err))
}

