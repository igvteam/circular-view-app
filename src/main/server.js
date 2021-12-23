// server (socket) listens for messages from IGV desktop

const net = require('net')

let server

function startServer(mainWindow, port, host) {

    port = port === undefined ? 60152 : port
    host = host || 'localhost'
    server = net.createServer()

    server.listen(port, host, () => {
        console.log(`TCP server listening on ${host}:${port}`)
    })

    server.on('connection', (socket) => {

        let buffer = []

        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`

        socket.on('data', (data) => {
            //console.log(`Client ${clientAddress}: ${data}`);
            for (let b of data) {
                if (b === 10) {   // Line feed
                    const message = Buffer.from(buffer).toString('utf-8')
                    try {
                        const json = JSON.parse(message)
                        if ('ping' === json.message) {
                            // No message to send
                        } else {
                            //console.log(message);
                            mainWindow.webContents.send('fromMain', message)
                        }
                    } catch (e) {
                        console.error(e)
                        console.error("Malformed message: " + message)
                    }
                    buffer = []
                    socket.write('OK\n')
                } else {
                    buffer.push(b)
                }
            }
        })

        socket.on('error', (err) => {
            console.error(`Error occurred in ${clientAddress}: ${err.message}`)
        })

    })

    return server
}


module.exports = {startServer}