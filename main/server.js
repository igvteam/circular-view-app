// server (socket) listens for messages from IGV desktop

const net = require('net');

let server;

function startServer(mainWindow, port, host) {

    port = port === undefined ? 1234 : port;
    host = host || 'localhost';
    server = net.createServer();

    server.listen(port, host, () => {
        console.log(`TCP server listening on ${host}:${port}`);
    });

    server.on('connection', (socket) => {

        let buffer = [];

        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`new client connected: ${clientAddress}`);

        socket.on('data', (data) => {
            console.log(`Client ${clientAddress}: ${data}`);
            for (let b of data) {
                if (b === 10) {   // Line feed
                    const message = String.fromCharCode.apply(null, buffer);
                    try {
                        const json = JSON.parse(message);
                        if ('ping' === json.message) {
                            // No message to send
                        } else {
                            //console.log(message);
                            mainWindow.webContents.send('fromMain', message);
                        }
                    } catch (e) {
                        console.error(e);
                        console.error("Malformed message: " + message);
                    }
                    buffer = [];
                } else {
                    buffer.push(b);
                }
            }
            socket.write('OK\r\n');
        });

        socket.on('close', (data) => {
            console.log(`connection closed: ${clientAddress}`);
        });

        socket.on('error', (err) => {
            console.log(`Error occurred in ${clientAddress}: ${err.message}`);
            console(err);
        });

    });

    return server;
}


module.exports = {startServer};