class Address {
    constructor(street, city, zipCode, country = 'France') {
        if (!street || !city || !zipCode) {
            throw new Error('Address requires street, city, and zipCode');
        }

        this.street = street;
        this.city = city;
        this.zipCode = zipCode;
        this.country = country;
    }

    toString() {
        return `${this.street}, ${this.zipCode} ${this.city}, ${this.country}`;
    }
}

module.exports = Address;
