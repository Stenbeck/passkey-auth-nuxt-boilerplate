# Passkey Boilerplate Site

Nuxt 3 + Passkey + Magic Link Boilerplate

A complete authentication boilerplate using **Passkeys** as the primary login method and **Magic Link (email-based)** as a secure fallback for devices or browsers that do not support WebAuthn/Passkeys — built with Nuxt 3, MongoDB, internal server API and TailwindCSS.

**DEMO**: https://passkey.stenbecklab.com

![Preview of Passkey Boilerplate](./public/preview.jpg)

---

## ✨ Features

- 🔐 **Passkey Login & Registration**
- 📧 **Magic Link (email-based)** as a secure fallback for devices or browsers that do not support WebAuthn/Passkeys
- 🍪 **Server-set, signed, short-lived, httpOnly cookies**
- 💡 **Built with Nuxt 3 + Server API (Nitro) + MongoDB/Mongoose + TailwindCSS**
- 🔗 **No built-in dependencies and very lightweight**
- 🏠 **Can be run on-prem, in the cloud or any hybrid of choice**

---

## 🧠 How It Works

### 🔑 Passkey Registration

1. User enters email
2. Challenge is generated and managed
3. Browser asks to store biometric/device auth
4. Credential is saved to the user record

### 🔑 Passkey Login

1. User enters email
2. Challenge is generated
3. Browser prompts for stored credential
4. Challenge is verified, counter is updated, token is set as cookie

### 🔁 Magic Link Login

1. User enters email
2. A secure token is generated and emailed
3. User clicks link → server verifies token → sets cookie

---

## 🛡 Security Notes

- Passkey challenges are short-lived and stored per user
- Counters are updated to prevent replay attacks
- Tokens are signed and stored with minimal data and short lifespan
- Email logins use one-time tokens valid for 15 minutes

- Security-headers middleware in place (easy to update)
- Custom rate-limiter to avoid brute force and API abuse
- Brute-force protection for mailadresses and failed attemts

---

## ⚙️ Project Structure

```
/server/api/auth/        ← All server-side logic (register, login, verify)
/server/middleware/      ← Server-side middleware (rate limiter, security headers etc.)
/middleware/             ← Nuxt client-side route guard (e.g. check login status before showing page)
/stores/                 ← Pinia authStore
/plugins/                ← Get user if token exists and store is empty (instead of storing data in cookie or localstorage)
/models/                 ← Mongoose schema for users and loginlogs
/utils/db.js             ← Centralized MongoDB connection helper
/pages/                  ← Only index and dashbaord. Index is the login page and dashboard is a placeholder when logged in
/pages/auth/             ← Only a /callback route for Magic Link to automatically retirect when verified
/components/             ← UI elements

```

---

## 📦 Installation

```bash
git clone https://github.com/stenbeck/passkey-boilerplate-site.git
cd passkey-boilerplate-site
yarn install
cp .env.example .env
```

Then edit `.env` and fill in:

```

# MongoDB
MONGO_URI=mongodb+srv://...

# JWT Secret
LOGIN_TOKEN_SECRET=...

# URL for site (used in magic link)
BASE_URL=https://...

# Email SMTP config for Nodemailer
SMTP_HOST=smtp.yourhost.com
SMTP_PORT=465
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
MAIL_FROM="Passkey Boilerplate Team <passkey@example.com>"

# Passkey Config
RP_ID=localhost
RP_NAME=Passkey Boilerplate Site
RP_ORIGIN=http://localhost:3000
```

---

## 🚀 Run in Dev

```bash
yarn dev
```

Visit `http://localhost:3000`

## 🧭 Future Ideas

- Admin UI for managing users
- Richer design and UX polish

---

## 👤 Author

Fredrik Stenbeck

Feel free to fork, adapt, or contribute.

## 🪪 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

Attribution is required in all public forks. Please credit Fredrik Stenbeck as the original author.
