'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const http2 = require('spdy');
const RED = require("node-red");
const expressApp = express();

process.setMaxListeners(0);
expressApp.use(`/`, express.static('./'));
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

const server2 = http2.createServer(options, expressApp);

const settings = require('./config/RED.js');
RED.init(server2, settings);

expressApp.use(settings.httpAdminRoot, RED.httpAdmin);
expressApp.use(settings.httpNodeRoot, RED.httpNode);

server2.listen(process.env.PORT || 8443, () => {
    let host = server2.address().address;
    let port = server2.address().port;
    console.log(`Listening at: https://${host}:${port}`);
});

RED.start();