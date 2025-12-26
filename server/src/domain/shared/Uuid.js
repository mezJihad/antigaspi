const crypto = require('crypto');

class Uuid {
    static random() {
        return crypto.randomUUID();
    }

    static isValid(uuid) {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    }
}

module.exports = Uuid;
