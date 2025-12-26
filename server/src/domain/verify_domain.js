const Money = require('./shared/Money');
const Address = require('./shared/Address');
const User = require('./iam/User');
const UserRole = require('./iam/UserRole');
const Seller = require('./catalog/Seller');
const Offer = require('./catalog/Offer');
const OfferStatus = require('./catalog/OfferStatus');

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        process.exit(1);
    }
    console.log(`✅ PASS: ${message}`);
}

function expectError(fn, expectedErrorMsg) {
    try {
        fn();
        console.error(`❌ FAIL: Expected error "${expectedErrorMsg}" but none was thrown.`);
        process.exit(1);
    } catch (error) {
        if (error.message.includes(expectedErrorMsg)) {
            console.log(`✅ PASS: Correctly caught error: "${error.message}"`);
        } else {
            console.error(`❌ FAIL: Expected error "${expectedErrorMsg}" but got "${error.message}"`);
            process.exit(1);
        }
    }
}

console.log('--- STARTING DOMAIN VERIFICATION ---\n');

// 1. Shared Kernel Tests
console.log('--- Shared Kernel ---');
const price10 = new Money(10, 'EUR');
const price20 = new Money(20, 'EUR');
assert(price10.isLessThan(price20), 'Money comparison works');
expectError(() => new Money(-5), 'Money amount cannot be negative');

const addr = new Address('123 Rue de Paris', 'Paris', '75001');
assert(addr.toString().includes('Paris'), 'Address toString works');

// 2. IAM Tests
console.log('\n--- IAM Context ---');
const user = User.create('test@test.com', 'hash', UserRole.SELLER);
assert(user.role === UserRole.SELLER, 'User created with correct role');

// 3. Catalog Context - Seller
console.log('\n--- Catalog: Seller ---');
const seller = Seller.create(user.id, 'Ma Boutique', addr, 'Super boutique');
assert(seller.status === 'PENDING', 'Seller starts in PENDING status');
seller.approve();
assert(seller.isApproved(), 'Seller can be approved');

// 4. Catalog Context - Offer
console.log('\n--- Catalog: Offer ---');
const originalPrice = new Money(100, 'EUR');
const promoPrice = new Money(50, 'EUR');
const invalidPromoPrice = new Money(150, 'EUR');

// Invariant: Price < OriginalPrice
expectError(() => {
    Offer.create(seller.id, 'Title', 'Desc', invalidPromoPrice, originalPrice, new Date('2030-01-01'));
}, 'Offer price must be lower than original price');

const offer = Offer.create(seller.id, 'Super Promo', 'Desc', promoPrice, originalPrice, new Date('2030-01-01'));
assert(offer.status === OfferStatus.DRAFT, 'Offer starts in DRAFT');

// Workflow
offer.submitForValidation();
assert(offer.status === OfferStatus.PENDING_VALIDATION, 'Offer submitted for validation');

expectError(() => {
    offer.updateDetails('New Title', 'New Desc');
}, 'Cannot update offer while pending validation');

offer.validate('admin-id');
assert(offer.status === OfferStatus.PUBLISHED, 'Offer published');

console.log('\n--- ALL TESTS PASSED ---');
