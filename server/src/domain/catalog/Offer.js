const Uuid = require('../shared/Uuid');
const OfferStatus = require('./OfferStatus');

class Offer {
    constructor({
        id,
        sellerId,
        title,
        description,
        price,
        originalPrice,
        pictureUrl,
        expirationDate,
        status = OfferStatus.DRAFT,
        statusHistory = []
    }) {
        this.id = id || Uuid.random();
        this.sellerId = sellerId;
        this.title = title;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.pictureUrl = pictureUrl;
        this.expirationDate = expirationDate ? new Date(expirationDate) : null;
        this.status = status;
        this.statusHistory = statusHistory;

        this._validateState();
    }

    static create(sellerId, title, description, price, originalPrice, expirationDate, pictureUrl) {
        if (!sellerId) throw new Error('Offer requires a sellerId');

        // Invariant: Price must be lower than original price
        if (price && originalPrice && !price.isLessThan(originalPrice)) {
            throw new Error('Offer price must be lower than original price');
        }

        // Invariant: Expiration date must be in the future
        if (expirationDate && new Date(expirationDate) <= new Date()) {
            throw new Error('Expiration date must be in the future');
        }

        return new Offer({
            sellerId,
            title,
            description,
            price,
            originalPrice,
            expirationDate,
            pictureUrl,
            status: OfferStatus.DRAFT
        });
    }

    submitForValidation() {
        if (this.status !== OfferStatus.DRAFT && this.status !== OfferStatus.REJECTED) {
            throw new Error('Only draft or rejected offers can be submitted');
        }

        this._validateContent(); // Ensure complete content before submission
        this._transitionTo(OfferStatus.PENDING_VALIDATION);
    }

    validate(adminUserId) {
        if (this.status !== OfferStatus.PENDING_VALIDATION) {
            throw new Error('Offer must be pending validation to be validated');
        }
        this._transitionTo(OfferStatus.PUBLISHED, adminUserId);
    }

    reject(adminUserId, reason) {
        if (this.status !== OfferStatus.PENDING_VALIDATION) {
            throw new Error('Offer must be pending validation to be rejected');
        }
        if (!reason) throw new Error('Rejection reason is required');

        this._transitionTo(OfferStatus.REJECTED, adminUserId, reason);
    }

    cancel(userId) {
        if (this.status !== OfferStatus.PUBLISHED) {
            throw new Error('Only published offers can be canceled');
        }
        this._transitionTo(OfferStatus.CANCELED, userId);
    }

    updateDetails(title, description, price, originalPrice) {
        if (this.status === OfferStatus.PENDING_VALIDATION) {
            throw new Error('Cannot update offer while pending validation');
        }

        // If published, strictly speaking we might want to reset to validation, 
        // but per requirements/invariants, let's enforce modifying only in DRAFT/REJECTED for now 
        // or reset status. Let's stick to the stricter rule: modifying published resets to DRAFT.

        const wasPublished = this.status === OfferStatus.PUBLISHED;

        this.title = title || this.title;
        this.description = description || this.description;

        if (price && originalPrice) {
            if (!price.isLessThan(originalPrice)) {
                throw new Error('Offer price must be lower than original price');
            }
            this.price = price;
            this.originalPrice = originalPrice;
        }

        if (wasPublished) {
            this._transitionTo(OfferStatus.DRAFT, null, 'Reset to draft after modification');
        }
    }

    _transitionTo(newStatus, changedBy = null, reason = null) {
        this.status = newStatus;
        this.statusHistory.push({
            status: newStatus,
            changedBy: changedBy,
            changedAt: new Date(),
            reason: reason
        });
    }

    _validateState() {
        // Check structural integrity if needed
        if (!this.sellerId) throw new Error('SellerId is required');
    }

    _validateContent() {
        if (!this.title || !this.description || !this.price || !this.originalPrice || !this.expirationDate) {
            throw new Error('Offer incomplete: missing required fields for submission');
        }
    }
}

module.exports = Offer;
