class Card {
    constructor(type, color) {
        this.type = type;
        this.color = color;
    }

    // Retourne le type de la carte
    getType() {
        return this.type;
    }

    // Retourne la couleur de la carte
    getColor() {
        return this.color;
    }

    // Change la couleur de la carte
    setColor(color) {
        this.color = color;
    }
}

module.exports = Card;