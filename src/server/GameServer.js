const Room = require('../classes/Room');
const Player = require('../classes/Player');
const RoomStates = require('../enum/RoomStates')
const TurnStates = require('../enum/TurnStates')


module.exports = function(io) {
    // Contient la liste des rooms du serveur 
    let roomList = [];

    // Lorsqu'un jouueur se connecte
    io.on('connection', socket => {
        let player = new Player(socket);

        // On indique au joueur qu'il est bien connecté, et on lui donne son uuid
        socket.emit('connected', socket.uuid);

        console.log(`The user ${socket.uuid} user logged in`);

        // Lorsqu'un joueur demande à rejoindre une room
        socket.on('joinRoom', roomId => {
            // On regarde si la room existe déjà
            const roomExists = roomList.some(room => room.getRoomName() === roomId);

            if(roomExists) {
                // Si elle existe, on ajoute le nouveau joueur à la liste des joueurs
                roomList.forEach(room => {
                    if(room.getRoomName() === roomId) {
                        room.addPlayer(player);
                    }
                });
            } else {
                // Si elle n'existe pas, on crée la nouvelle room
                let room = new Room(roomId, player.getUuid());
                room.addPlayer(player);
                roomList.push(room);
            }

            socket.join(roomId);
            console.log(`The user ${socket.uuid} joined the room ${roomId}`);

            // On récupère les infos à jour de la room, et on les envoie à tous les joueurs de la room
            let room = (roomList.filter(room => room.getRoomName() === roomId)[0]);
            if(room.getNumberOfPlayers() > 1) {
                room.setRoomState(RoomStates.READY);
            }

            const gameData = room.getRoomData();
            io.to(roomId).emit('gameData', gameData);
        });

        socket.on('startGame', roomId => {
            let room = roomList.filter(room => room.getRoomName() === roomId)[0];
            room.startGame();

            const gameData = room.getRoomData();
            io.to(roomId).emit('gameData', gameData);
        });

        // Lorsqu'un joueur joue une carte
        socket.on('playCard', cardPlayedData => {
            const roomId = cardPlayedData.roomId;
            const playerId = cardPlayedData.playerId;
            const cardId = cardPlayedData.cardId;

            let room = roomList.find(room => room.getRoomName() === roomId);
            let player = room.getPlayer(playerId);
            // On récupère la carte qui vient d'être jouée
            const cardPlayed = player.getCard(cardId);
            // On retire la carte de la main du joueur
            player.removeCard(cardId);
            // On ajoute la carte joué au tas de cartes
            room.addCardToHeap(cardPlayed);

            const currentTurn = room.getPlayerTurn();
            const currentTurnIndex = room.getPlayerIndex(currentTurn.getUuid());
            const playerNumber = room.getNumberOfPlayers();
            // On calcule l'index du joueur du tour suivant en fonction du sens de rotation des tours
            let newIndex = currentTurnIndex;
            switch(room.getTurnDirection()) {
                case TurnStates.TURN_LEFT: 
                    newIndex++;
                    newIndex = newIndex % playerNumber;
                    break;
                case TurnStates.TURN_RIGHT: 
                    newIndex--;
                    if(newIndex < 0) {
                        newIndex = playerNumber + newIndex;
                    }
                    break;
            }

            room.setPlayerTurn(newIndex);

            const gameData = room.getRoomData();
            io.to(roomId).emit('gameData', gameData);
        });
    });
}