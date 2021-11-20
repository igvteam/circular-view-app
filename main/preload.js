const {
  contextBridge,
  ipcRenderer
} = require("electron");


// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
      send: (channel, data) => {
      	// whitelist channels
      	let validChannels = ["toIGV", "preferences"];
      	if (validChannels.includes(channel)) {
      		ipcRenderer.send(channel, data);
      	}
      },

      // Called by renderer to register a callback for the channel "fromMain".
      receive: (channel, func) => {
        let validChannels = ["fromMain"];
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender`
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      }
    })
