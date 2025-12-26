class Money {
    constructor(amount, currency = 'EUR') {
        if (amount === undefined || amount === null) {
            throw new Error('Money amount is required');
        }
        if (isNaN(amount)) {
            throw new Error('Money amount must be a number');
        }
        if (amount < 0) {
            throw new Error('Money amount cannot be negative');
        }

        this.amount = Number(amount);
        this.currency = currency;
    }

    static from(amount, currency = 'EUR') {
        return new Money(amount, currency);
    }

    isGreaterThan(other) {
        this._checkCurrency(other);
        return this.amount > other.amount;
    }

    isLessThan(other) {
        this._checkCurrency(other);
        return this.amount < other.amount;
    }

    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }

    _checkCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: cannot compare ${this.currency} with ${other.currency}`);
        }
    }

    toString() {
        return `${this.amount} ${this.currency}`;
    }
}

module.exports = Money;
