const Room = require('./classes/Room');
const Player = require('./classes/Player');

const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();
const port = 3000;

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

// On définit Handlebars comme moteur de template
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'));

// On définit la route d'accueil
app.get('/', (req, res) => {
    res.render('home');
});

// On définit la route qui gère une partie
app.get('/game/:id', (req, res) => {
    const roomId = req.params.id;

    res.render('game', {'roomId': roomId});
});

// Contient la liste des rooms du serveur 
let roomList = [];

// Lorsqu'un jouueur se connecte
io.on('connection', socket => {
    let player = new Player(socket);

    // On indique au joueur qu'il est bien connecté, et on lui donne son uuid
    socket.emit('connected', socket.uuid)

    console.log(`The user ${socket.uuid} user logged in`);

    // Lorsqu'un joueur demande à rejoindre une room
    socket.on('joinRoom', roomId => {
        // On regarde si la room existe déjà
        const roomExists = roomList.some(room => room.getRoomName() === roomId)

        if(roomExists) {
            // Si elle existe, on ajoute le nouveau joueur à la liste des joueurs
            roomList.forEach(room => {
                if(room.getRoomName() === roomId) {
                    room.addPlayer(player);
                }
            });
        } else {
            // Si elle n'existe pas, on crée la nouvelle room
            let room = new Room(roomId, player.getUuid())
            room.addPlayer(player);
            roomList.push(room);
        }

        socket.join(roomId)
        console.log(`The user ${socket.uuid} joined the room ${roomId}`)

        // On récupère les infos à jour de la room, et on les envoie à tous les joueurs de la room
        const gameData = (roomList.filter(room => room.getRoomName() === roomId)[0]).getRoomData();
        io.to(roomId).emit('gameData', gameData);
    });

});

// On lance le serveur sur le port $port
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});