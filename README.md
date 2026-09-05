# Portfolio App

A modern, high-performance personal web portfolio website and administration dashboard built with SvelteKit, TypeScript, PostgreSQL, Drizzle ORM, and Redis.

## Overview

This project is a full-stack personal portfolio application designed around Clean Architecture principles. It features a public-facing website styled with a Neobrutalism design system and a private management dashboard powered by shadcn-svelte.

The public frontend features fast server-side rendering (SSR), dynamic content section headers, visibility controls, Cloudflare R2 / local image upload handling, Cloudflare Turnstile bot protection, and Redis cache-aside support. The administrative backend provides secured CRUD operations, system analytics, interactive or non-interactive administrator creation, contact message management, and profile administration.

## Features

- **Public Portfolio**: Responsive Neobrutalism UI featuring Hero, About, What I Can Do (Services), Skills, Featured Work, and Contact sections.
- **Dynamic Section Headers**: Centralized section header management (eyebrow, title, description) editable via the admin dashboard.
- **Section Visibility Controls**: Global toggle switches to hide or display individual homepage sections dynamically.
- **Hero Photo Toggle**: Flexible hero section supporting full-width text layouts or split photo composition.
- **Cloudflare Turnstile Protection**: Non-interactive anti-bot challenge on the public contact form.
- **Cloudflare R2 Object Storage**: Serverless-compatible, zero-egress cloud storage for image uploads with automatic WebP conversion and thumbnail generation using `@aws-sdk/client-s3`. Local disk storage acts as a fallback for offline development.
- **Netlify Serverless Ready**: Adapter for Netlify Functions (`@sveltejs/adapter-netlify`) with optimized PostgreSQL connection pooling and direct email delivery.
- **Automated Database Migrations**: GitHub Actions workflow (`.github/workflows/migrate.yml`) for automated database migration execution on managed PostgreSQL databases (Neon, Supabase, Railway).
- **Admin Dashboard**: Full content management system built with shadcn-svelte for managing profile details, services, skills, projects, and incoming contact messages.
- **Analytics & Metrics**: Visitor metrics, response rate indicators, and interactive status charts.
- **CLI & Non-Interactive Admin Creation**: CLI command (`npm run create-admin`) supporting interactive prompts or environment variables (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- **Security & Authentication**: JWT authentication with httpOnly, Secure, SameSite=Strict cookies, argon2 password hashing, strict Content Security Policy (CSP), and Redis rate limiting on contact endpoints and authentication routes.
- **Direct Mail Processing**: Serverless-safe direct email notification dispatch via Nodemailer.
- **Caching Layer**: Redis cache-aside pattern for fast public site loads and instant cache invalidation upon admin content mutations.

## Tech Stack

- **Framework**: SvelteKit (`@sveltejs/adapter-netlify`)
- **Language**: TypeScript
- **Database**: PostgreSQL (Managed: Neon / Supabase / Railway)
- **ORM**: Drizzle ORM & Drizzle Kit
- **Cloud Storage**: Cloudflare R2 (`@aws-sdk/client-s3`) & Sharp
- **Bot Protection**: Cloudflare Turnstile
- **Caching**: Managed Redis (Upstash / Redis Cloud) via `ioredis`
- **Authentication**: JWT (`jose`) & `argon2`
- **Styling**: Tailwind CSS v4, `shadcn-svelte`, `bits-ui`
- **Icons**: Lucide

## Prerequisites

Ensure the following tools are available:

- Node.js (v24.x recommended)
- npm (v10.x or higher)
- PostgreSQL database (Managed service like Neon / Supabase / Railway or local PostgreSQL server)
- Redis server or Managed Redis (Upstash / Redis Cloud)
- Cloudflare R2 bucket & API token (for production image uploads)
- Cloudflare Turnstile Site Key & Secret (for bot protection)
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the project root directory by copying `.env.example`:

```env
# Node Environment & Debugging
NODE_ENV=development
PUBLIC_DEBUG_MODE=true
APP_PORT=3000
APP_BASE_URL=http://localhost:3000

# Site Configuration
PUBLIC_SITE_TITLE="My Portfolio"
PUBLIC_SITE_DESCRIPTION="Full-Stack Web Developer Portfolio"

# Database Configuration (Managed PostgreSQL or Local)
DATABASE_URL="postgres://postgres:root@localhost:5432/portfolio"

# Redis Configuration (Managed Redis or Local)
REDIS_URL="redis://localhost:6379"

# JWT Authentication Secrets (min 32 chars each)
JWT_ACCESS_SECRET="change_me_to_a_random_64_char_string_min_32_chars"
JWT_REFRESH_SECRET="change_me_too_to_a_random_64_char_string_min_32"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security & Rate Limiting
RATE_LIMIT_CONTACT_MAX=5
RATE_LIMIT_CONTACT_WINDOW=10m
RATE_LIMIT_LOGIN_MAX=5
LOGIN_LOCKOUT_WINDOW=15m
LOGIN_LOCKOUT_DURATION=15m

# File Storage (Local fallback)
UPLOAD_DIR="./uploads"
MAX_UPLOAD_SIZE_MB=5

# Email / SMTP Configuration
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="password"
SMTP_FROM_NAME="Portfolio Admin"
SMTP_FROM_EMAIL="noreply@example.com"
TARGET_EMAIL="owner@example.com"

# Cloudflare Turnstile (Bot Protection)
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Cloudflare R2 Storage (Production Uploads)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## Usage

### 1. Database Migration & Seeding

Run pending SQL migrations against your database:

```bash
npm run db:migrate
```

Seed initial database content (section headers, default about data, skills, services):

```bash
npm run seed
```

### 2. Administrator Account Creation

Create an administrator account interactively:

```bash
npm run create-admin
```

Or non-interactively via environment variables:

```bash
DATABASE_URL="your-production-db-url" \
ADMIN_NAME="Admin" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="YourSecurePassword123!" \
npm run create-admin
```

### 3. Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser to view the public website, or access `/admin/login` to log into the administrative control panel.

## Deploying to Netlify (Serverless)

### 1. Database & GitHub Actions Setup

1. In your GitHub repository settings under **Settings > Secrets and variables > Actions**, add a new repository secret named `DATABASE_URL` with your managed PostgreSQL connection string (Neon, Supabase, or Railway).
2. The GitHub Action workflow (`.github/workflows/migrate.yml`) will automatically execute pending database migrations whenever schema changes are pushed to `main`.
3. After the initial migration finishes, create your production admin user from your terminal:
   ```bash
   DATABASE_URL="postgres://user:password@your-managed-db-host:5432/dbname" npm run create-admin
   ```

### 2. Netlify Environment Configuration

In the **Netlify Dashboard** under **Site configuration > Environment variables**, configure the following variables:

| Variable | Description / Example |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Managed PostgreSQL URL (`postgres://...`) |
| `REDIS_URL` | Managed Redis TLS URL (`rediss://...`) |
| `JWT_ACCESS_SECRET` | Min 32-char random string |
| `JWT_REFRESH_SECRET` | Min 32-char random string |
| `APP_BASE_URL` | Your Netlify site URL (e.g. `https://your-site.netlify.app`) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile Site Key |
| `TURNSTILE_SECRET_KEY` | Turnstile Secret Key |
| `R2_ACCOUNT_ID` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` | Cloudflare R2 Bucket Name |
| `R2_PUBLIC_URL` | Public Bucket/CDN URL (e.g. `https://pub-xxx.r2.dev`) |
| `SMTP_HOST`, `SMTP_USER`, etc. | SMTP Provider credentials (Resend, SendGrid, Mailgun) |

### 3. Deploying

Push your code to your connected GitHub repository branch. Netlify will build and deploy the SvelteKit app automatically using `@sveltejs/adapter-netlify`.

## Project Structure

```
portfolio/
├── .github/
│   └── workflows/
│       └── migrate.yml            # GitHub Actions DB migration workflow
├── src/
│   ├── app.d.ts
│   ├── hooks.server.ts            # Auth verification, CSP headers, rate limiting
│   ├── lib/
│   │   ├── components/            # UI components (admin & public)
│   │   ├── server/
│   │   │   ├── db/                # Drizzle schema, seed, migration runner & CLI admin script
│   │   │   ├── queue/             # Direct email queue dispatch
│   │   │   ├── cache/             # Redis client initialization & cache helper functions
│   │   │   ├── storage/           # Local & Cloudflare R2 Storage providers
│   │   │   ├── repositories/      # Data access layer (PostgreSQL / Drizzle)
│   │   │   ├── services/          # Business logic layer & cache operations
│   │   │   └── container.ts       # Dependency injection container
│   │   └── validation/            # Zod schemas for input validation
│   └── routes/                    # SvelteKit routing tree
│       ├── +page.server.ts        # Public homepage loader & Turnstile contact action
│       ├── +page.svelte           # Public homepage presentation
│       ├── admin/                 # Private admin dashboard routes
│       └── api/                   # REST endpoints
├── static/                        # Static assets
├── drizzle/                       # Generated SQL migration files
├── drizzle.config.ts              # Drizzle ORM configuration
├── netlify.toml                   # Netlify build configuration
├── svelte.config.js               # SvelteKit configuration
├── vite.config.ts                 # Vite build configuration
└── package.json
```

## Development & Code Quality

Available scripts for development and code quality maintenance:

- `npm run dev`: Start Vite development server.
- `npm run check`: Run `svelte-check` for TypeScript and Svelte diagnostics.
- `npm run lint`: Run ESLint and Prettier code formatting checks.
- `npm run format`: Automatically format codebase using Prettier.
- `npm run db:generate`: Generate SQL migration files from Drizzle schema changes.
- `npm run db:migrate`: Run pending migrations against the target database.
- `npm run db:studio`: Launch Drizzle Studio interface to manage database records visually.

## API Endpoints

- `POST /?:contact`: Public contact form submission action. Verifies Turnstile token, enforces Redis rate limiting, stores inquiry in PostgreSQL, and sends direct email notifications.
- `POST /api/admin/auth/login`: Admin authentication endpoint issuing HTTP-only JWT cookies.
- `POST /api/admin/auth/logout`: Clears authentication cookies and invalidates administrative session.
- `POST /api/admin/upload`: Secure image upload handler supporting Cloudflare R2 or local storage.

## License

This project is open-source and available under the [MIT License](LICENSE).
