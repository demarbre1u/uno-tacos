const { uid } = require('uid');

class Player {
    constructor(socket) {
        const uuid = uid(32);
        socket.uuid = uuid;

        this.uuid = uuid;
        this.username = `user#${this.uuid}`;
    }

    getUuid() {
        return this.uuid;
    }

    getUsername() {
        return this.username;
    }
}

module.exports = Player;