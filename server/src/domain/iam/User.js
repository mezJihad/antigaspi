const Uuid = require('../shared/Uuid');
const UserRole = require('./UserRole');

class User {
    constructor({ id, email, passwordHash, role = UserRole.CUSTOMER, isActive = true }) {
        this.id = id || Uuid.random();
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.isActive = isActive;

        this._validate();
    }

    static create(email, passwordHash, role) {
        return new User({
            email,
            passwordHash,
            role
        });
    }

    changePassword(newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    _validate() {
        if (!this.email) throw new Error('User email is required');
        if (!this.passwordHash) throw new Error('User password hash is required');
        if (!Object.values(UserRole).includes(this.role)) {
            throw new Error('Invalid user role');
        }
    }
}

module.exports = User;
