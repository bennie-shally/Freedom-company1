# Security Specification: Freedom Company

## Data Invariants
1. An investment must have a `userId` that matches the authenticated user.
2. A user cannot change their own `role` or `balance` directly (except through specific investment/withdrawal logic which I've implemented client-side for now, but rules should restrict).
3. Document IDs must be valid.
4. Timestamps must be server-generated.

## The Dirty Dozen Payloads
1. Attempt to register with `role: "admin"`.
2. Attempt to update balance directly.
3. Attempt to read other users' deposits.
4. Attempt to create a deposit for another user.
5. Attempt to approve own deposit.
6. Attempt to delete a transaction history entry.
7. Attempt to set an investment `endsAt` to 1 minute in the future.
8. Attempt to withdraw more than account balance.
9. Attempt to inject a 1MB string into a username.
10. Attempt to spoof `referralCode` of another user.
11. Attempt to read support chats of other users.
12. Attempt to bypass admin panel fixed password by calling Firestore directly.

## Rules Draft Strategy
- `isValidUser`: checks `username.size() <= 50`, `balance` immutability on user side.
- `isValidDeposit`: checks `amount > 0`, `proofUrl` presence.
- `isAdmin`: checks `exists(/databases/$(database)/documents/users/$(request.auth.uid))` and checks `.role == 'admin'`.
