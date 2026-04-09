# Frontend MM (Matrimony App)

React + TypeScript + Vite frontend for the matrimony domain.

## Overview

This app is aligned with:

- `backend/openapi/openapi-matrimony-v1.yml` for matrimony domain APIs
- `@fruzoos/auth-core` for authentication/session/token handling

Auth logic is intentionally not reimplemented in this app.

## Features

- Login / Register / Reset password (via `auth-core`)
- Protected routes for authenticated users
- Discover profiles with filters and pagination
- Profile detail page
- Send interest to a profile
- View sent and received interests
- Update received interest status (accept/decline)
- Shortlist profiles and remove from shortlist
- View and update your matrimony profile

## API Configuration

Environment variables:

- `VITE_API_BASE_URL` (default: `http://localhost:8085`)
- `VITE_REQUEST_TIMEOUT_MS` (default: `30000`)
- `VITE_USE_MOCK_API` (`true`/`false`, default: `false`)
- `VITE_GOOGLE_CLIENT_ID` (optional, for Google login)
- `VITE_TELEGRAM_BOT_NAME` (optional, for Telegram login)

## Main Routes

- `/` discover profiles (protected)
- `/profiles/:profileId` profile details (protected)
- `/shortlists` shortlist management (protected)
- `/interests` sent/received interests (protected)
- `/profile` my matrimony profile (protected)
- `/login`
- `/register`
- `/reset-password`
- `/about` about page

## Run

Create local env file:

```bash
cp .env.example .env
```

Generate SSL keys for local HTTPS development:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=IN/ST=UP/L=Lucknow/O=TeliVarVadhuKhoj/OU=Unit/CN=localhost"
```

Install dependencies:

Start development server:

```bash
npm install
```

Build for production:

```bash
npm run dev
```

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Run on port 80 with Docker

Build image:

```bash
docker build -t frontend-mm .
```

Run container on port 80:

```bash
docker run --rm -p 80:80 frontend-mm
```


