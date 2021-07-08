const { uid } = require('uid');

class Player {
    constructor(socket) {
        const uuid = uid(32);
        socket.uuid = uuid;

        this.uuid = uuid;
        this.username = `user#${this.uuid}`;
    }

    // Retourne l'UUID de joueur
    getUuid() {
        return this.uuid;
    }

    // Retourne le nom d'utilsiateur du joueur
    getUsername() {
        return this.username;
    }
}

module.exports = Player;