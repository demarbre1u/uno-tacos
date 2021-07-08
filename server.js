const { uid } = require('uid');

const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/game/:id', (req, res) => {
    const roomId = req.params.id;
    console.log(roomId)

    res.sendFile(__dirname + '/public/game.html');
});

io.on('connection', socket => {
    socket.uuid = uid(32);
    console.log(`${socket.uuid} user logged in`);
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});