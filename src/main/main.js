const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const fs = require('fs')
const path = require('path')
const net = require('net')
const createMenu = require('./menu.js')
const {startServer} = require('./server.js')


const configDefaults = {
    port: 60152,
    igvHost: "localhost",
    igvPort: 60151
}

const globals = {};

(async () => {
    await app.whenReady()
    globals.config = Object.assign({}, configDefaults)
    try {
        const overrides = require(path.join(app.getPath('userData'), 'config.json'))
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
        width: 700,
        height: 730,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        //mainWindow.webContents.openDevTools()
    })

    mainWindow.on('closed', () => {
        globals.mainWindow = undefined
    })

    const appPath = app.getAppPath()
    await mainWindow.loadFile(path.join(appPath, 'index.html'))
    mainWindow.webContents.send('fromMain', `{"message": "ready"}`)

    if (!globals.server) {
        globals.server = startServer(mainWindow, globals.config.port)
    }

    return mainWindow
}

function sendToIGV(message, host, igvport) {

    try {
        const socket = new net.Socket()

        // Send a connection request to the server.
        socket.connect({port: igvport, host: host}, function () {
            //console.log('TCP connection established with the server.');
            socket.write(message)
            socket.end()
        })

        socket.on('error', (err) => {
            console.error(err)
            globals.mainWindow.webContents.send('fromMain', `{"message": "alert", "data": "${err}"}`)
        })

        socket.on('end', function () {

        })

    } catch (err) {
        console.error(err)
        globals.mainWindow.webContents.send('fromMain', `{"message": "alert", "data": "${err}"}`)
    }
}

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) globals.mainWindow = createMainWindow()
})


// Quit when all windows are closed
app.on('window-all-closed', function () {
    //if (process.platform !== 'darwin')
    app.quit()
})


ipcMain.on('toIGV', (event, msg) => {
    sendToIGV(msg, globals.config.igvHost, globals.config.igvPort)
})

ipcMain.on('preferences', (event, msg) => {

    // The preferences window is Modal, so it will be in focus.
    BrowserWindow.getFocusedWindow().hide()

    const json = JSON.parse(msg)
    if (json.hasOwnProperty('port') && json.hasOwnProperty('igvHost') && json.hasOwnProperty('igvPort')) {
        if (json.port && json.port !== globals.config.port) {
            if (globals.server) {
                globals.server.close()
            }
            startServer(globals.mainWindow, json.port)
        }
        Object.assign(globals.config, json)
        writeConfig(globals.config)
    }
})

function writeConfig(config) {
    const p = `${app.getPath('userData')}/config.json`
    console.log("Writing config to " + p)
    fs.writeFile(p, JSON.stringify(config), err => console.error(err))
}

