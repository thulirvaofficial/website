/**
 * THULIRVA Legacy Server Entry Wrapper
 * Delegates directly to the common standalone backend in /backend
 */
const backendServer = require("../../backend/server.js");

module.exports = backendServer;

if (require.main === module) {
    if (typeof backendServer.startServer === "function") {
        backendServer.startServer();
    }
}
