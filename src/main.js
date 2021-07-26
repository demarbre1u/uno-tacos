const CardColors = require('./enum/CardColors');
const CardTypes = require('./enum/CardTypes');
const RoomStates = require('./enum/RoomStates');

const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();
const port = process.env.PORT || 8080;

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);
const gameServer = require('./server/GameServer');

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

    res.render('game', {
        roomId: roomId, 
        CardColors: JSON.stringify(CardColors),
        CardTypes: JSON.stringify(CardTypes), 
        RoomStates: JSON.stringify(RoomStates)
    });
});

gameServer(io); 

// On lance le serveur sur le port $port
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});