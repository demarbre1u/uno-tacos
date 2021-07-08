class Room {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.playerList = [];
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

    // Renvoie les données de la Room
    getRoomData() {
        return {
            roomName: this.name, 
            roomOwner: this.owner, 
            roomPlayers: this.playerList
        };
    }
}

module.exports = Room;