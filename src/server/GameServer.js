const Room = require('../classes/Room');
const Player = require('../classes/Player');
const RoomStates = require('../enum/RoomStates')
const CardColors = require('../enum/CardColors');
const CardTypes = require('../enum/CardTypes');

module.exports = function(io) {
    // Contient la liste des rooms du serveur 
    let roomList = [];

    const MAX_PLAYER_NUMBER = 4;
    const MIN_PLAYER_NUMBER = 2;

    // Lorsqu'un jouueur se connecte
    io.on('connection', socket => {
        let player = new Player(socket);

        // On indique au joueur qu'il est bien connecté, et on lui donne son uuid
        socket.emit('connected', socket.uuid);

        // Lorsqu'un joueur se déconnecte
        socket.on('disconnect', () => {
            console.log(`${player.getUuid()} disconnected`);

            // On parcourt toutes les rooms
            roomList.forEach(room => {
                room.removePlayer(player.getUuid());

                // Si le propriétaire de la Room s'en va et qu'il reste des joueurs, on change de propriétaire
                if(room.isOwnedBy(player.getUuid()) && room.getNumberOfPlayers() > 0) {
                    room.setOwner(room.pickRandomPlayer().getUuid());
                }

                if(room.getNumberOfPlayers() < MIN_PLAYER_NUMBER) {
                    room.setRoomState(RoomStates.WAITING_FOR_PLAYERS);
                }

                // On notifie la room pour tenir les autres joueurs à jour
                const gameData = room.getRoomData();
                io.to(room.getRoomName()).emit('gameData', gameData);
            });

            roomList = roomList.filter(room => room.getNumberOfPlayers() !== 0);            
        });

        console.log(`The user ${socket.uuid} user logged in`);

        // Lorsqu'un joueur demande à rejoindre une room
        socket.on('joinRoom', roomId => {
            // On regarde si la room existe déjà
            let room = roomList.find(room => room.getRoomName() === roomId);

            if(room) {
                // Si la partie est déjà en cours dans la Room, on ne fait rien
                const isWaitingForPlayers = room.getRoomState() === RoomStates.WAITING_FOR_PLAYERS || room.getRoomState() === RoomStates.READY;
                if(! isWaitingForPlayers) {
                    socket.emit('gameAlreadyOngoing', roomId);
                    return;
                }

                // Si la Room est pleine, on n'ajoute pas le joueur
                if(room.getNumberOfPlayers() >= MAX_PLAYER_NUMBER) {
                    socket.emit('roomFull', roomId);
                    return;
                }

                // Si elle existe, on ajoute le nouveau joueur à la liste des joueurs
                room.addPlayer(player);
            } else {
                // Si elle n'existe pas, on crée la nouvelle room
                room = new Room(roomId, player.getUuid());
                room.addPlayer(player);
                roomList.push(room);
            }

            socket.join(roomId);
            console.log(`The user ${socket.uuid} joined the room ${roomId}`);

            // On récupère les infos à jour de la room, et on les envoie à tous les joueurs de la room
            if(room.getNumberOfPlayers() >= MIN_PLAYER_NUMBER) {
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

        // Lorsqu'un joueur demande de piocher
        socket.on('drawCard', data => {
            const {userId, roomId} = data;

            // On récupère la Room dans laquelle se trouve le joueur
            let room = roomList.find(room => room.getRoomName() === roomId);
            const playerTurn = room.getPlayerTurn();

            // On vérifie si c'est bien le tour du joueur qui demande à piocher
            // Dans le cas contraire, on ne fait rien
            if(playerTurn.getUuid() !== userId) {
                return;
            }

            // Si rien n'a encore été joué, le joueur ne peut pas piocher
            if(! room.hasCardBeenPlayed()) {
                return;
            }

            // S'il y a des cartes à piocher, alors on ne peut pas piocher manuellement
            if(room.getCardsToDraw() > 0) {
                return;
            }
            
            // On récupère la première carte du paquet de carte, et on l'ajoute à la main du joueur
            room.drawCardsForPlayer(userId, 1);

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

            // On récupère la dernière carte jouée
            const lastPlayedCard = room.getLastPlayedCard();

            // On regarde si la carte peut être jouée
            let isCardPlayable = true;
            if(room.getCardsToDraw() > 0) {
                // S'il y a des cartes à piocher, on ne peut que jouer la carte de pioche correspondante
                const isSameType = lastPlayedCard.getType() === cardPlayed.getType();
                isCardPlayable = isSameType;
            } else {
                const isHeapEmpty = lastPlayedCard === null;
                const isSameColor = lastPlayedCard && lastPlayedCard.getColor() === cardPlayed.getColor();
                const isSameType = lastPlayedCard && lastPlayedCard.getType() === cardPlayed.getType();
                const isSpecialCard = cardPlayed.getColor() === CardColors.COLOR_SPECIAL || (lastPlayedCard &&lastPlayedCard.getColor() === CardColors.COLOR_SPECIAL);
                isCardPlayable = isHeapEmpty || isSameColor || isSameType || isSpecialCard;
            }
            
            // Si la carte n'est pas jouable, on ne fait rien
            if(! isCardPlayable) {
                return;
            }

            // TODO: on applique les effets de la carte si elle en a un 
            const nextPlayer = room.getNextPlayerTurn();
            let canPlay;
            switch(cardPlayed.getType()) {
                case CardTypes.TYPE_SKIP:
                    // Si le joueur suivant ne peut pas jouer, on passe son tour
                    canPlay = nextPlayer.getCards().some(card => card.getType() === CardTypes.TYPE_SKIP);
                    if(! canPlay) {
                        room.setPlayerTurn(nextPlayer);
                    }
                    break;
                case CardTypes.TYPE_PLUS_2:
                    canPlay = nextPlayer.getCards().some(card => card.getType() === CardTypes.TYPE_PLUS_2);
                    // Si le joueur suivant peut jouer, on indique que le joueur suivant devra piocher 2 cartes de plus
                    room.addCardsToDraw(2);

                    if(! canPlay) {
                        // Sinon, le joueur doit piocher
                        let cardsToDraw = room.getCardsToDraw();
                        room.drawCardsForPlayer(nextPlayer.getUuid(), cardsToDraw);
                        room.resetCardsToDraw();
                    }
                    break;                
                case CardTypes.TYPE_PLUS_4:
                    canPlay = nextPlayer.getCards().some(card => card.getType() === CardTypes.TYPE_PLUS_4);
                    // Si le joueur suivant peut jouer, on indique que le joueur suivant devra piocher 4 cartes de plus
                    room.addCardsToDraw(4);

                    if(! canPlay) {
                        // Sinon, le joueur doit piocher
                        let cardsToDraw = room.getCardsToDraw();
                        room.drawCardsForPlayer(nextPlayer.getUuid(), cardsToDraw);
                        room.resetCardsToDraw();
                    }
                case CardTypes.TYPE_REVERSE:
                case CardTypes.TYPE_COLOR_CHANGE:
                    break;
            }

            // On passe au tour suivant
            const newPlayer = room.getNextPlayerTurn();
            room.setPlayerTurn(newPlayer);

            // On retire la carte de la main du joueur
            player.removeCard(cardId);
            // On ajoute la carte joué au tas de cartes
            room.addCardToHeap(cardPlayed);

            const gameData = room.getRoomData();
            io.to(roomId).emit('gameData', gameData);
        });
    });
}