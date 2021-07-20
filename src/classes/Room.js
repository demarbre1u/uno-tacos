const RoomStates = require('../enum/RoomStates');
const TurnStates = require('../enum/TurnStates');

const CardHelper = require('./CardHelper');

class Room {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.playerList = [];
        this.state = RoomStates.WAITING_FOR_PLAYERS;

        this.turnDirection = TurnStates.TURN_LEFT;
        this.playerTurn = null;

        this.cardHeap = [];
        this.cardDeck = [];
    }

    // Initialise une partie
    startGame() {
        this.state = RoomStates.GAME_ONGOING;

        // On prends un joueur au hasard pour commencer 
        const randomIndex = this.pickRandomPlayer();
        this.playerTurn = this.playerList[randomIndex];

        this.cardDeck = CardHelper.generateCardDeck();
        this.playerList.forEach(player => {
            const cards = this.cardDeck.splice(0, 7);
            cards.forEach(card => player.addCard(card));
        })
    }

    // Réinitialise le deck de carte
    resetCardDeck() {
        const cardsToRemove = this.cardHeap.length - 1;
        let removedCards = this.cardHeap.splice(0, cardsToRemove);
        this.cardDeck = CardHelper.shuffleCards(removedCards);
    }

    // Ajoute une carte au tas de cartes jouées
    addCardToHeap(card) {
        this.cardHeap.push(card);
    }

    // Vérifie qu'au moins une carte a été jouée
    hasCardBeenPlayed() {
        return this.cardHeap.length > 0;
    }

    // Retourne l'index d'un joueur au hasard dans la liste des joueurs
    pickRandomPlayer() {
        return Math.floor(Math.random() * this.playerList.length);
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
    containsPlayer(playerUuid) {
        return this.playerList.some(player => player.getUuid() === playerUuid);
    }

    // Retourne le joueur dans la salle correspondant à l'uuid donné
    getPlayer(playerUuid) {
        return this.playerList.find(player => player.getUuid() === playerUuid);
    }

    // Retourne l'index dans la liste des joueurs du joueur correspondant à l'uuid donné
    getPlayerIndex(playerUuid) {
        return this.playerList.findIndex(player => player.getUuid() === playerUuid);
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

    // Retourne le nom joueur dont c'est le tour de jouer
    getPlayerTurn() {
        return this.playerTurn;
    }

    // Change le joueur dont c'est le tour
    setPlayerTurn(player) {
        this.playerTurn = player;
    }

    // Retourne le sens de rotation des tours
    getTurnDirection() {
        return this.turnDirection;
    }

    // Retourne la dernière carte jouée, ou null s'il n'y en a aucune
    getLastPlayedCard() {
        const heapSize = this.cardHeap.length;

        return heapSize ? this.cardHeap[ heapSize - 1 ] : null;
    }

    // Renvoie une carte du deck
    getCardFromDeck() {
        return this.cardDeck.pop();
    }

    getNextPlayerTurn() {
        const currentTurn = this.getPlayerTurn();
        const currentTurnIndex = this.getPlayerIndex(currentTurn.getUuid());
        const playerNumber = this.getNumberOfPlayers();
        // On calcule l'index du joueur du tour suivant en fonction du sens de rotation des tours
        let newIndex = currentTurnIndex;
        switch(this.getTurnDirection()) {
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

        return this.playerList[newIndex];
    }

    // Renvoie les données de la Room
    getRoomData() {
        return {
            roomName: this.name, 
            roomOwner: this.owner, 
            roomPlayers: this.playerList, 
            roomState: this.state, 
            roomPlayerTurn: this.playerTurn,
            roomTurnDirection: this.turnDirection, 
            roomCardDeck: this.cardDeck, 
            roomCardHeap: this.cardHeap
        };
    }
}

module.exports = Room;