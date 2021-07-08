const { uid } = require('uid');

const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();
const port = 3000;

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'));

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/game/:id', (req, res) => {
    const roomId = req.params.id;
    console.log(roomId)

    res.render('game', {'roomId': roomId});
});

io.on('connection', socket => {
    socket.uuid = uid(32);
    console.log(`${socket.uuid} user logged in`);
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});