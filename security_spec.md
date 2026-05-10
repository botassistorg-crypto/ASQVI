# Security Specification - ASQVI Digital Store

## Data Invariants
1. Only `botassist.org@gmail.com` can create, update, or delete products, categories, and site settings.
2. Orders can be created by any visitor, but only the admin can read or update them.
3. Once an order is created, its `amount` and `productId` should be immutable for non-admin users (though only admin reads anyway).
4. All string fields must have size limits to prevent "Denial of Wallet" attacks.
5. bKash number in settings can only be changed by the admin.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthorized Product Create**: A user with email `hacker@gmail.com` trying to create a product.
2. **Settings Poisoning**: A visitor trying to change the `bKashNumber`.
3. **Order Spoofing**: Creating an order with a massive `amount` (e.g., 10^15).
4. **ID Injection**: Using a 2KB string as a product ID.
5. **Field Injection**: Adding `isPromoted: true` to a product when the schema doesn't allow it.
6. **Order Scraping**: An authenticated user trying to list all orders.
7. **Status Manipulation**: A customer trying to update their own order status to `completed`.
8. **PII Leak**: An unauthenticated user trying to read user settings or private order details via `get`.
9. **Recursive Cost Attack**: A script trying to create 1000 orders in a second (though Firestore handles rate limiting, rules should be tight).
10. **Type Mismatch**: Sending a string for the `price` field in a product.
11. **Orphaned Order**: Creating an order for a `productId` that doesn't exist.
12. **Incomplete Product**: Creating a product missing the `imageUrl`.

## Test Runner Plan
We will use `firestore.rules.test.ts` to simulate these attacks using the Firebase emulator or unit test logic.
