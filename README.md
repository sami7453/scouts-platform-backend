# Scouts Platform Backend

API backend for scouting reports. Requires Node.js and PostgreSQL.

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your credentials.

## Usage

- `npm start` – start the server
- `npm run dev` – start with nodemon
- `npm run lint` – run ESLint
- `npm test` – run Jest tests

## Environment Variables

See `.env.example` for all variables to configure database and Stripe credentials.

Uploaded PDF files are stored in the `uploads/` directory.
