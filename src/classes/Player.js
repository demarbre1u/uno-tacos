const { uid } = require('uid');

class Player {
    constructor(socket) {
        const uuid = uid(32);
        socket.uuid = uuid;

        this.uuid = uuid;
        this.username = `user#${this.uuid}`;
        this.cards = [];
    }

    // Ajoute une carte aux cartes d'un joueur
    addCard(card) {
        this.cards.push(card);
    }

    // Retourne la carte de la main d'un joueur correspondant à un id donné
    getCard(cardId) {
        return this.cards[cardId];
    }

    // Retire une carte de la main d'un joueur correspondant à un id donné
    removeCard(cardId) {
        this.cards = this.cards.filter((card, index) => {
            console.log({index, cardId})
            return index !== cardId
        });
    }

    // Récupère la liste des cartes d'un joueur
    getCards() {
        return this.cards;
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