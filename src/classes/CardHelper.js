const CardColors = require('./../enum/CardColors');
const CardTypes = require('./../enum/CardTypes');
const Card = require('./Card');

class CardHelper {
    // Génère un deck de cartes
    static generateCardDeck() {
        let cardDeck = [];

        // On génère les cartes de 0 à 9, +2, Reverse, et Skip, pour chaque couleur
        for(let type = CardTypes.TYPE_0; type <= CardTypes.TYPE_PLUS_2; type++) {
            for(let color = CardColors.COLOR_RED; color <= CardColors.COLOR_YELLOW; color++) {
                cardDeck.push(new Card(type, color));
            }
        }
    
        // On génère les cartes spéciales de changement de couleur, et +4
        cardDeck.push(new Card(CardTypes.TYPE_PLUS_4, CardColors.COLOR_SPECIAL));
        cardDeck.push(new Card(CardTypes.TYPE_COLOR_CHANGE, CardColors.COLOR_SPECIAL));
        cardDeck.push(new Card(CardTypes.TYPE_COLOR_CHANGE, CardColors.COLOR_SPECIAL));
        cardDeck.push(new Card(CardTypes.TYPE_COLOR_CHANGE, CardColors.COLOR_SPECIAL));

        return CardHelper.shuffleCards(cardDeck);
    }

    // Prends un deck de cartes, et les mélange
    static shuffleCards(cardDeck) {
        const deckSize = cardDeck.length;
        for (let cardIndex = deckSize - 1; cardIndex > 0; cardIndex--)
        {
            let randomIndex = Math.floor(Math.random() * deckSize)

            let tmpCard = cardDeck[cardIndex];
            cardDeck[cardIndex] = cardDeck[randomIndex];
            cardDeck[randomIndex] = tmpCard;
        }

        return cardDeck;
    }
}

module.exports = CardHelper;