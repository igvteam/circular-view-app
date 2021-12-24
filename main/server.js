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

        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`new client connected: ${clientAddress}`);

        let buffer = '';
        socket.on('data', (data) => {
            // only the first 256 element to prevent DOS
            console.log(`Client ${clientAddress}: buffer.size=${buffer.length} data.size=${data.length} data[0,256]=${data.slice(0,256)}..`);

            let start = 0;
            let lfPos = data.indexOf(10, start);
            while (-1!=lfPos) {
                buffer += data.toString('utf8', start, lfPos);
                try {
                    // FIXME: inefficient, parsing twice for non-ping message
                    const json = JSON.parse(buffer);
                    if ('ping' === json.message) {
                        // No message to send
                    } else {
                        mainWindow.webContents.send('fromMain', buffer);
                    }
                    socket.write('OK\r\n');
                } catch (e) {
                    console.error(e);
                    console.error("Malformed message: " + buffer);
                }
                buffer = '';

                start = lfPos + 1;
                lfPos = data.indexOf(10, start);
            }

            if (start<data.length) {
                buffer += data.toString('utf8', start, data.length);
            }

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