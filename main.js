// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const path = require('path');
const createMenu = require('./menu.js');

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {

    mainWindow = new BrowserWindow({
        title: "IGV",
        show: false,
        width: 600,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = undefined;
    });

    await mainWindow.loadFile(path.join(__dirname, 'index.html'));

    return mainWindow;
};


(async () => {

    await app.whenReady();
    mainWindow = await createMainWindow();
    Menu.setApplicationMenu(createMenu(mainWindow));

})();

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
    sendToIGV(msg)
})


// server (socket) listens for messages from IGV desktop

const net = require('net');
const port = 1234;
const host = 'localhost';
const server = net.createServer();

server.listen(port, host, () => {
    console.log(`TCP server listening on ${host}:${port}`);
});

server.on('connection', (socket) => {

    let buffer = [];

    var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`new client connected: ${clientAddress}`);

    socket.on('data', (data) => {
        console.log(`Client ${clientAddress}: ${data}`);
        for (let b of data) {
            if (b === 10) {   // Line feed
                try {
                    const message = String.fromCharCode.apply(null, buffer);
                    const json = JSON.parse(message);
                    if ('ping' === json.message) {
                        // No message to send
                    } else {
                        mainWindow.webContents.send('fromMain', message);
                    }
                } catch (e) {
                    console.error("Malformed message: " + message);
                }
                buffer = [];
            } else {
                buffer.push(b);
            }
        }
        socket.write('OK\r\n');
    });


// Add a 'close' event handler to this instance of socket
    socket.on('close', (data) => {
        console.log(`connection closed: ${clientAddress}`);
    });


// Add a 'error' event handler to this instance of socket
    socket.on('error', (err) => {
        console.log(`Error occurred in ${clientAddress}: ${err.message}`);
    });

});


// Socket for sending to igv
// The port number and hostname of the server.
function sendToIGV(message) {
    const igvport = 60151;

// Create a new TCP client.
    const client = new net.Socket();
// Send a connection request to the server.
    client.connect({port: igvport, host: host}, function () {
        // If there is no error, the server has accepted the request and created a new
        // socket dedicated to us.
        console.log('TCP connection established with the server.');

        // The client can now send data to the server by writing to its socket.
        client.write(message);

        client.end();
    })

// // The client can also receive data from the server by reading from its socket.
// client.on('data', function(chunk) {
//   console.log(`Data received from the server: ${chunk.toString()}.`);
//
//   // Request an end to the connection after the data has been received.
//   client.end();
// });

    client.on('end', function () {
        console.log('Requested an end to the TCP connection');
    });
}
