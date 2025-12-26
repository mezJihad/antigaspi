const Uuid = require('../shared/Uuid');
const SellerStatus = require('./SellerStatus');

class Seller {
    constructor({ id, userId, storeName, address, description, status = SellerStatus.PENDING, rejectionReason = null }) {
        this.id = id || Uuid.random();
        this.userId = userId;
        this.storeName = storeName;
        this.address = address;
        this.description = description;
        this.status = status;
        this.rejectionReason = rejectionReason;

        this._validate();
    }

    static create(userId, storeName, address, description) {
        return new Seller({
            userId,
            storeName,
            address,
            description
        });
    }

    approve() {
        this.status = SellerStatus.APPROVED;
        this.rejectionReason = null;
    }

    reject(reason) {
        if (!reason) throw new Error('Rejection reason is required');
        this.status = SellerStatus.REJECTED;
        this.rejectionReason = reason;
    }

    isApproved() {
        return this.status === SellerStatus.APPROVED;
    }

    _validate() {
        if (!this.userId) throw new Error('Seller must be linked to a user');
        if (!this.storeName) throw new Error('Store name is required');
        if (!this.address) throw new Error('Address is required');
    }
}

module.exports = Seller;
