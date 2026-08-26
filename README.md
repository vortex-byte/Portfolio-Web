# Portfolio App

A modern, high-performance personal web portfolio website and administration dashboard built with SvelteKit, TypeScript, PostgreSQL, Drizzle ORM, and Redis.

## Overview

This project is a full-stack personal portfolio application designed around Clean Architecture principles. It features a public-facing website styled with a Neobrutalism design system and a private management dashboard powered by shadcn-svelte.

The public frontend features fast server-side rendering (SSR), dynamic content section headers, visibility controls, image upload handling, and Redis cache-aside support. The administrative backend provides secured CRUD operations, system analytics, interactive CLI user creation, contact message management, and profile administration.

## Features

- **Public Portfolio**: Responsive Neobrutalism UI featuring Hero, About, What I Can Do (Services), Skills, Featured Work, and Contact sections.
- **Dynamic Section Headers**: Centralized section header management (eyebrow, title, description) editable via the admin dashboard.
- **Section Visibility Controls**: Global toggle switches to hide or display individual homepage sections dynamically.
- **Hero Photo Toggle**: Flexible hero section supporting full-width text layouts or split photo composition.
- **Admin Dashboard**: Full content management system built with shadcn-svelte for managing profile details, services, skills, projects, and incoming contact messages.
- **Analytics & Metrics**: Visitor metrics, response rate indicators, and interactive status charts.
- **Interactive CLI Admin Creation**: Secure CLI command (`npm run create-admin`) for interactive administrator account creation.
- **Security & Authentication**: JWT authentication with httpOnly, Secure, SameSite=Strict cookies, argon2 password hashing, and Redis rate limiting on contact endpoints and authentication routes.
- **Background Mail Processing**: BullMQ and Redis integration for asynchronous email notification dispatch via Nodemailer.
- **Caching Layer**: Redis cache-aside pattern for fast public site loads and instant cache invalidation upon admin content mutations.

## Tech Stack

- **Framework**: SvelteKit (Node adapter)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM & Drizzle Kit
- **Caching & Queue**: Redis & BullMQ
- **Authentication**: JWT (`jose`) & `argon2`
- **Styling**: Tailwind CSS v4, `shadcn-svelte`, `bits-ui`
- **Asset Processing**: Sharp & TipTap Rich Text Editor
- **Icons**: Lucide

## Prerequisites

Ensure the following tools are installed on your host machine before continuing:

- Node.js (v20.x or higher recommended)
- npm (v10.x or higher)
- PostgreSQL server (v14.x or higher)
- Redis server (v6.x or higher)
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

3. Ensure PostgreSQL and Redis services are running on your system.

4. Create the target PostgreSQL database:
   ```sql
   CREATE DATABASE portfolio_db;
   ```

## Environment Variables

Create a `.env` file in the project root directory by copying `.env.example` or creating a new file with the following variables:

```env
# Node Environment & Debugging
NODE_ENV=development
PUBLIC_DEBUG_MODE=true

# Site Configuration
PUBLIC_SITE_TITLE="Web Developer Portfolio"
PUBLIC_SITE_DESCRIPTION="Full-Stack Web Developer Portfolio"

# Database Configuration
DATABASE_URL="postgres://postgres:postgres@localhost:5432/portfolio_db"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Authentication Secrets
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars-long"

# Email / SMTP Configuration
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="password"
SMTP_FROM="noreply@example.com"
ADMIN_NOTIFICATION_EMAIL="admin@example.com"

# Upload Configuration
UPLOAD_DIR="./static/uploads"
MAX_FILE_SIZE_MB=5
```

## Usage

### 1. Database Migration & Seeding

Generate and execute database migrations:

```bash
npm run db:generate
npm run db:push
```

Seed initial database content (section headers, default about data, skills, services):

```bash
npm run seed
```

### 2. Administrator Account Creation

Create an initial administrator account via the interactive CLI command:

```bash
npm run create-admin
```

Follow the prompt to enter the administrator name, email, and password.

### 3. Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser to view the public website, or access `/admin/login` to log into the administrative control panel.

## Project Structure

```
portfolio/
├── src/
│   ├── app.d.ts
│   ├── hooks.server.ts            # Auth verification, security headers, rate limiting
│   ├── lib/
│   │   ├── components/            # UI components (admin & public)
│   │   ├── server/
│   │   │   ├── db/                # Drizzle schema, migrations, seed, CLI admin script
│   │   │   ├── queue/             # BullMQ queue & email worker definition
│   │   │   ├── redis/             # Redis client initialization & cache helper functions
│   │   │   ├── repositories/      # Data access layer (PostgreSQL / Drizzle)
│   │   │   ├── services/          # Business logic layer & cache operations
│   │   │   └── container.ts       # Dependency injection container
│   │   └── validation/            # Zod schemas for input validation
│   └── routes/                    # SvelteKit routing tree
│       ├── +page.server.ts        # Public homepage data loader
│       ├── +page.svelte           # Public homepage presentation
│       ├── admin/                 # Private admin dashboard routes
│       └── api/                   # Public REST endpoints
├── static/                        # Static assets & file uploads
├── drizzle/                       # Generated SQL migration files
├── drizzle.config.ts              # Drizzle ORM configuration
├── svelte.config.js               # SvelteKit configuration
├── vite.config.ts                 # Vite build configuration
└── package.json
```

## Development

Available scripts for development and code quality maintenance:

- `npm run dev`: Start Vite development server.
- `npm run check`: Run `svelte-check` for TypeScript and Svelte diagnostics.
- `npm run lint`: Run ESLint and Prettier code formatting checks.
- `npm run format`: Automatically format codebase using Prettier.
- `npm run db:studio`: Launch Drizzle Studio interface to manage database records visually.

## Build & Deployment (VPS)

This section describes deploying the application directly to a Linux Virtual Private Server (VPS) using standard Linux services (Nginx, PM2, systemd, PostgreSQL, Redis) without Docker.

### 1. Prerequisites

Ensure your Linux server (Ubuntu/Debian) has the required software installed:

```bash
sudo apt update && sudo apt install -y nodejs npm postgresql redis-server nginx pm2
```

### 2. Environment & Directory Setup

Clone the project to `/var/www/portfolio`, install dependencies, configure `.env`, run migrations, seed data, and create the admin user:

```bash
cd /var/www/portfolio
npm install --production=false
npm run db:push
npm run seed
npm run create-admin
```

### 3. Build Application

Build the production bundle using SvelteKit Node Adapter:

```bash
npm run build
```

The output will be generated inside the `build/` directory.

### 4. Process Management (PM2)

Start the application node server using PM2 to manage uptime and restarts:

```bash
pm2 start build/index.js --name "portfolio-app"
pm2 save
pm2 startup
```

### 5. Nginx Reverse Proxy Configuration

Configure Nginx as a reverse proxy for port `3000` (or your configured application port). Create `/etc/nginx/sites-available/portfolio`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site configuration and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Certbot)

Secure your installation with Let's Encrypt SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## API Docs

The system exposes internal server-side endpoints and public API handlers:

- `POST /api/contact`: Accepts public contact form inquiries. Enforces Redis-backed rate limiting and pushes notification jobs to the BullMQ email queue.
- `POST /api/admin/auth/login`: Admin authentication endpoint issuing HTTP-only JWT cookies.
- `POST /api/admin/auth/logout`: Clears authentication cookies and invalidates administrative session.

Further detailed product requirements, architecture notes, database entity relationships, and UI/UX design token specifications are documented in the `.agents/` folder.

## Troubleshooting

- **Database Connection Failure**: Check `DATABASE_URL` credentials and confirm PostgreSQL service is running (`systemctl status postgresql`).
- **Redis Connection Error**: Ensure Redis server is active on `localhost:6379` (`systemctl status redis`).
- **Cache Staleness**: Admin mutations automatically clear relevant Redis keys (`content:section_headers`, etc.). Flush Redis manually if needed: `redis-cli flushall`.
- **Upload Directory Permission Issue**: Verify application process has write permissions to `./static/uploads`.

## License

This project is open-source and available under the [MIT License](LICENSE).
