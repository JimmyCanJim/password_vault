# Password Vaut


## Security
- ### __src/lib/pin.ts__ (Authntictio and Key Generation):
    Converts a user's 5-digit pin into a 256-bit Main Key using PBKDF2 (Key Stretching). And then it hashes the Main Key a second time.
    - PBKDF2 (Password Based Key Derivation Function 2): Iteratively applies a pseudorandom function (PRF) to the password and salt.
    - Slat: A random, non-secret string added to prevent attacks to a password.
    - Hash Function now : SHA-256, want to do SHA-512.

- ### __src/lib/vault.ts__ (Data Encryption):
    - Uses AES-GCM (Advanced Encryption Standard in Counter Mode) to lock and unlock your passwords.
    - It is a widely used symmetric-key cryptographic mode that provides both high-speed data encryption (confidentiality) and authentication (integrity).
    - It encrypts the data with random initialization vectors before it leaves the browser.

- ### __src/lib/server-actions.ts__ (Server Communication):
    - Middleman between the React app and Firebase. It recieves the encrypted data and the Authentication Hash and stores them.

- ### __src/routes/_locked.tsx__ and __login.tsx__ (Route Gaurds):
    - Prevents users from accessing the /vault URLs without having a valid session token in their browser.

- ### __Protection Against Physical Device Theft__: 
    - __Volatile Memory:__ The master encryption key lives purely in a short-term browser memory. When the tab is closed the key gets removed immediately.
    - __Three-Step Login and 2FA:__ The thief needs to know the vault name, the 8-digit pin needs access to the gmail to retrieve the 6-digit OTP. 3 layers of security.

- ### __Api Layer:__
    - __Strict Schema Rules:__ The database will physically reject any request that tries to delete a vault, upload massive files, or add unexpected data fields. It only accepts the exact 6 fields my app uses.

    - __Zod Payload Validation:__ Before the Cloudflare Worker even talks to Firebase, it strictly validates the incoming data types using Zod. If a bot sends a number where a string should be, the server drops the request.

    - __Expiring OTPs:__ The 6-digit email codes self-destruct after exactly 5 minutes, meaning an intercepted code is useless shortly after it is requested.
