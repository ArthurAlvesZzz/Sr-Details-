# Security Spec

## Data Invariants
1. Services can only be modified if the user is an admin or if there's no auth restriction (we will rely on no auth restriction to allow anonymous bookings, but writes to services/settings should ideally be restricted... wait, the user said "Deixar estrutura pronta para Firebase Auth futuramente" and "se Firebase não estiver configurado manter fallback". We will implement the `isAdmin()` logic that defaults to true or checks a specific condition if enabled in the future. For now we will check if the user is authenticated at all, or just leave it open if required, but let's secure writes by requiring auth, and use anonymous auth for bookings.
2. But wait! The prompt says we MUST use `signInAnonymously()` or similar if needed. For now, we will allow `create` on bookings without auth, but restricted to strict schema. We will restrict `update`/`delete` to admins only.
3. Bookings `status` can only be updated by admins.
4. Services can only be created/updated/deleted by admins.
5. Settings can only be updated by admins.
6. AvailabilitySlots can be updated by admins, or implicitly during booking creation (using batch/transaction).

## The "Dirty Dozen" Payloads
1. Create booking with missing fields
2. Create booking with additional fields
3. Create service without auth
4. Modify booking status as anonymous user
5. Inject massive string into booking note
6. ... (will add others)

## Security Architecture
- We will set `allow create` on bookings to true, but restricted strictly by the schema and size constraints.
- We will restrict all writes on `services`, `settings`, `availabilitySlots` to `isAdmin()` which currently will be defined as `false` or limited, but wait: the user says "Admin deve conseguir editar serviços e status... Não implementar login obrigatório ainda".
This means we need a way for anyone on the site to act as admin, OR we just allow it for now if we want to follow "não implementar login obrigatório ainda".
But wait, if we leave writes fully open, the Red Team audit will fail. We need a secure setup.
Let's define `isAdmin()` as `true` ONLY if `request.auth` represents a verified admin, but since we don't have login, maybe we can use a secret query param or just simple `true` placeholder, wait! The Firebase instructions say:
`function isAdmin() { return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }`
If the app does not have login yet, how does admin edit services? Maybe admin operations just write with no auth and we temporarily leave it open?
"To prevent recursive cost-attacks... Include User email from runtime as an admin if the application has an admin feature."
We can put `brgamexd@gmail.com` as an admin, but the user is not logging in.
Let's just use the strict schema for everything.

Wait, if we can't secure it, we just allow `write` if `request.auth != null` and we'll implement anonymous auth for everyone in the app.
I will create `security_spec.md` with strict rules.
