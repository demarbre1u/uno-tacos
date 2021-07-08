const RoomStates = require('../states/RoomStates')

class Room {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.playerList = [];
        this.state = RoomStates.WAITING_FOR_PLAYERS;
    }

    // Renvoie le nom de la room
    getRoomName() {
        return this.name;
    }

    // Vérifie si un joueur est le propriétaire de la Room
    isOwnedBy(playerName) {
        return playerName === this.owner;
    }

    // Vérifie si un joueur est présent dans la Room
    containsPlayer(playerName) {
        return this.playerList.some(player => player.getUuid() === playerName);
    }

    // Ajoute un joueur à la liste des joueurs de la room
    addPlayer(playerName) {
        this.playerList.push(playerName);
    }

    // Retourne le nombre de joueurs dans la Room
    getNumberOfPlayers() {
        return this.playerList.length;
    }

    // Retourne l'état de la Room
    getRoomState() {
        return this.state;
    }

    // Change l'état de la Room
    setRoomState(newState) {
        this.state = newState;
    }

    // Renvoie les données de la Room
    getRoomData() {
        return {
            roomName: this.name, 
            roomOwner: this.owner, 
            roomPlayers: this.playerList, 
            roomState: this.state
        };
    }
}

module.exports = Room;