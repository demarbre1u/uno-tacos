const express = require('express');
const app = express();
const port = 3000;

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', socket => {
    console.log('a user logged in');
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});