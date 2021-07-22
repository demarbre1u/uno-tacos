const CardColors = require('../enum/CardColors');
const CardTypes = require('../enum/CardTypes');
const RoomStates = require('../enum/RoomStates');
const TurnStates = require('../enum/TurnStates');
const CardHelper = require('./CardHelper');

const STARTING_CARDS_PER_HAND = 1;

class Room {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.playerList = [];
        this.state = RoomStates.WAITING_FOR_PLAYERS;
        this.cardsToDraw = 0;

        this.turnDirection = TurnStates.TURN_LEFT;
        this.playerTurn = null;

        this.cardHeap = [];
        this.cardDeck = [];
    }

    // Initialise une partie
    startGame() {
        this.state = RoomStates.GAME_ONGOING;
        this.cardsToDraw = 0;
        this.turnDirection = TurnStates.TURN_LEFT;
        this.cardHeap = [];

        this.playerList.map(player => {
            player.setPlace(0);
            return player;
        });

        // On prends un joueur au hasard pour commencer 
        this.playerTurn = this.pickRandomPlayer();

        this.cardDeck = CardHelper.generateCardDeck();
        this.playerList.forEach(player => {
            player.emptyCards();
            const cards = this.cardDeck.splice(0, STARTING_CARDS_PER_HAND);
            cards.forEach(card => player.addCard(card));
        })
    }

    // Réinitialise le deck de carte
    resetCardDeck() {
        const cardsToRemove = this.cardHeap.length - 1;
        let removedCards = this.cardHeap.splice(0, cardsToRemove);

        removedCards.map(card => {
            if(card.getType() === CardTypes.TYPE_COLOR_CHANGE) {
                card.setColor(CardColors.COLOR_SPECIAL);
            }

            return card;
        })

        this.cardDeck = CardHelper.shuffleCards(removedCards);
    }

    // Pioche une carte et l'ajoute à la main d'un joueur
    drawCardsForPlayer(playerId, cardNumber) {
        let currentPlayer = this.getPlayer(playerId);

        for(let i = 0; i < cardNumber; i++) {
            let drawnCard = this.getCardFromDeck();
            if(! drawnCard) {
                this.resetCardDeck();
                drawnCard = this.getCardFromDeck();
            }
    
            if(drawnCard) {
                currentPlayer.addCard(drawnCard);
            }
        }
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
        const randomIndex = Math.floor(Math.random() * this.playerList.length);
        return this.playerList[randomIndex];
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

    // Retire un joueur de la liste des joueurs
    removePlayer(playerUuid) {
        this.playerList = this.playerList.filter(player => player.getUuid() !== playerUuid);
    }

    // Modifie le propriétaire de la room
    setOwner(playerUuid) {
        this.owner = playerUuid;
    }

    // Retourne le nombre de joueurs dans la Room en train de jouer
    getNumberOfPlayersInGame() {
        const playerNumbers = this.playerList.filter(player => player.getPlace() === 0).length;
        
        console.log(playerNumbers)

        return playerNumbers;
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

    // Modifie le sens de rotation des tours 
    setTurnDirection(turnDirection) {
        this.turnDirection = turnDirection;
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
        let player;
        do {
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

            player = this.playerList[newIndex];
        } while (player.getPlace() !== 0);
        
        return player;
    }

    // Indique le nombre de cartes qui devra être pioché
    addCardsToDraw(cardNumber) {
        this.cardsToDraw += cardNumber;
    }

    // Récupère le nombre de cartes à piocher 
    getCardsToDraw() {
        return this.cardsToDraw;
    }

    // Réinitialise le nombre de cartes qui devra être pioché
    resetCardsToDraw() {
        this.cardsToDraw = 0;
    }

    // Indique si la partie est finie 
    isGameOver() {
        // S'il reste plus d'un joueur en jeu, la partie n'est pas finie
        if(this.getNumberOfPlayersInGame() > 1) {
            return false;
        } 

        let lastPlayer = this.playerList.find(player => player.getPlace() === 0);
        lastPlayer.setPlace( this.getNumberOfPlayers() );

        return true;
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