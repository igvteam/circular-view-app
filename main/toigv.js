const net = require('net');

module.exports = function (message, host, igvport) {

    const socket = new net.Socket();

    // Send a connection request to the server.
    socket.connect({port: igvport, host: host}, function () {

        //console.log('TCP connection established with the server.');
        socket.write(message);
        socket.end();
    })

    socket.on('error', (err) => {
        console(err);
    });

    socket.on('end', function () {
        console.log('Requested an end to the TCP connection');
    });
}