const Room = require('../classes/Room');
const Player = require('../classes/Player');

module.exports = function(io) {
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
}