# Job na Gringa - Astro Migration

**Job na Gringa** is a platform connecting Brazilian professionals with remote
international job opportunities. This project is currently being migrated from a
static HTML/CSS/JavaScript stack to a modern Astro framework implementation.

## 🎯 Project Overview

Job na Gringa helps Brazilian professionals find remote work opportunities with
international companies. The platform provides job listings, career resources,
community features, and member dashboards.

**Website**: [jobnagringa.com.br](https://jobnagringa.com.br)

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build) v5.16.9
- **Language**: TypeScript (strict mode)
- **Output**: Static Site Generation (SSG)
- **Authentication**: [Clerk](https://clerk.com) v5.0.0
- **Styling**: Custom CSS (migrated from Webflow)
- **Package Manager**: Bun

## ✨ Features & Integrations

### Core Features

- **Job Listings**: Browse and search international remote jobs
- **Member Dashboard**: Personalized dashboard for registered users
- **Community**: Community features and resources
- **Career Resources**: Job search guides, resume reviews, interview Q&A
- **Multi-language**: Portuguese (pt-BR) and English support

### Third-Party Integrations

#### Authentication

- **Clerk**: User authentication and session management
  - Custom domain: `clerk.jobnagringa.com.br`
  - User data persistence to cookies and localStorage

#### Analytics & Tracking

- **Google Analytics**: Website analytics
- **Google Tag Manager**: Tag management
- **Mautic**: Marketing automation and lead tracking
  - Custom domain: `mautic.jobnagringa.com.br`

#### CMS & Content

- **Finsweet CMS**: Webflow CMS integration
  - CMS Load attributes
  - CMS Filter attributes
  - CMS Sort attributes

#### Communication

- **Chatwoot**: Live chat widget
  - Self-hosted at `chatwoot.jobnagringa.com.br`

#### Utilities

- **ViaCEP**: Brazilian postal code lookup API
- **Slater App**: Custom JavaScript management for Webflow

## 📁 Project Structure

```
/
├── public/                 # Static assets (images, videos, documents)
├── src/
│   ├── components/        # Reusable Astro components
│   │   ├── forms/         # Form components (Input, Select, Checkbox)
│   │   └── integrations/  # Third-party integration components
│   ├── layouts/           # Page layouts
│   │   ├── BaseLayout.astro
│   │   ├── DashboardLayout.astro
│   │   └── LandingLayout.astro
│   ├── pages/             # Astro pages (file-based routing)
│   ├── scripts/           # TypeScript modules for client-side code
│   │   ├── api.ts         # API utilities (ViaCEP, etc.)
│   │   ├── auth.ts        # Clerk authentication
│   │   ├── tracking.ts    # Analytics and Mautic tracking
│   │   └── utils.ts       # Utility functions
│   └── styles/            # CSS files
│       ├── components/    # Component-specific styles
│       ├── webflow/       # Migrated Webflow styles
│       └── global.css     # Global styles
├── src-legacy/            # Original HTML/CSS/JS files (being migrated)
├── astro.config.mjs       # Astro configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Setup & Installation

### Prerequisites

- **Bun**: Latest version (recommended package manager)
- **Node.js**: 20+ (required for Astro)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd legacy
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see
   [Environment Variables](#environment-variables))

4. **Start development server**

   ```bash
   bun run dev
   ```

   The site will be available at `http://localhost:4321`

## 📝 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Clerk Authentication

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
PUBLIC_CLERK_DOMAIN=https://clerk.jobnagringa.com.br
PUBLIC_CLERK_ACCOUNTS_URL=https://accounts.jobnagringa.com.br
```

### Mautic Marketing Automation

```env
PUBLIC_MAUTIC_URL=https://mautic.jobnagringa.com.br
```

### Chatwoot Live Chat

```env
PUBLIC_CHATWOOT_URL=https://chatwoot.jobnagringa.com.br
PUBLIC_CHATWOOT_TOKEN=your_chatwoot_token
```

### Slater App (Optional)

```env
PUBLIC_SLATER_PROJECT_ID=8634
PUBLIC_SLATER_SCRIPT_ID=22027
```

### Analytics (Optional)

```env
PUBLIC_GA_ID=G-XXXXXXXXXX
PUBLIC_GTM_ID=GTM-XXXXXXX
```

## 🧞 Available Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally, before deploying     |
| `bun run check`           | Run Astro type checking                          |
| `bun run lint`            | Run ESLint on source files                       |
| `bun run format`          | Format code with Prettier                        |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |

## 🔄 Migration Status

This project is actively being migrated from static HTML/CSS/JavaScript to
Astro. The migration plan includes:

### Completed ✅

- Astro project initialization
- TypeScript configuration
- Base layout components
- CSS migration (normalize, webflow, custom styles)
- Core component structure
- Integration components (Clerk, Mautic, Chatwoot, Finsweet)
- Script modules (auth, tracking, API utilities)

### In Progress 🚧

- Page migrations from `src-legacy/` to `src/pages/`
- Component extraction and refactoring
- Form implementations
- Navigation components

### Planned 📋

- Complete page migrations
- Performance optimization
- Lighthouse score improvements
- Testing implementation

See `docs/plans/MIGRATION_PLAN.md` and `docs/plans/MIGRATION_TASKS_REPORT.md`
for detailed migration tasks.

## 🏗️ Architecture

### Layouts

- **BaseLayout**: Common HTML structure with Head, Navigation, Footer
- **DashboardLayout**: Member dashboard layout with authentication
- **LandingLayout**: Landing page layout with optimized loading

### Components

Components are organized by functionality:

- **Forms**: Reusable form inputs (Input, Select, Checkbox, FormWrapper)
- **Integrations**: Third-party service integrations
- **Navigation**: Site navigation and menus
- **Analytics**: Analytics and tracking components

### Scripts

Client-side TypeScript modules:

- **auth.ts**: Clerk authentication functions
- **tracking.ts**: Analytics and Mautic tracking
- **api.ts**: API utilities (ViaCEP, etc.)
- **utils.ts**: General utility functions

### Styling

- **Global styles**: Base styles and CSS variables
- **Component styles**: Component-specific CSS
- **Webflow styles**: Migrated Webflow CSS (preserved for compatibility)
- **Utilities**: Utility classes and helpers

## 🔐 Authentication

The project uses Clerk for authentication. Key features:

- User registration and login
- Session management
- Protected routes
- User data persistence
- Custom Clerk domain support

See `src/scripts/auth.ts` for authentication utilities.

## 📊 Analytics & Tracking

### Google Analytics

- Pageview tracking
- Event tracking
- Custom dimensions

### Mautic Marketing Automation

- Lead tracking
- Form submission tracking
- Pageview tracking with user identification
- Custom event tracking

See `src/scripts/tracking.ts` for tracking utilities.

## 🌐 Internationalization

The project supports multiple languages:

- **Default**: Portuguese (pt-BR)
- **Secondary**: English (en)

Configured in `astro.config.mjs`:

```javascript
i18n: {
  defaultLocale: 'pt-br',
  locales: ['pt-br', 'en'],
  routing: {
    prefixDefaultLocale: false,
  },
}
```

## 🧪 Development Workflow

### Issue Tracking

This project uses **bd** (beads) for issue tracking. See `AGENTS.md` for
workflow details.

**Quick Reference:**

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Astro Check**: Type checking

### Git Workflow

When completing work:

1. File issues for remaining work
2. Run quality gates (tests, linters, builds)
3. Update issue status
4. **PUSH TO REMOTE** (mandatory):
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```

## 🚀 Deployment

### Build

```bash
bun run build
```

The production build will be in the `dist/` directory.

### Build Configuration

- **Output**: Static (SSG)
- **Assets**: `_assets` folder
- **Inline Stylesheets**: Auto (small assets)
- **Prefetch**: Enabled for all links
- **Client Prerender**: Enabled (experimental)

### Site Configuration

- **Site URL**: `https://jobnagringa.com.br`
- **Port**: 4321 (development)
- **Host**: true (accessible on network)

## 📚 Documentation

- **Migration Plan**: `docs/plans/MIGRATION_PLAN.md` - Detailed migration tasks
- **Migration Report**: `docs/plans/MIGRATION_TASKS_REPORT.md` - Migration
  progress
- **Scripts Guide**: `src/scripts/SCRIPTS_GUIDE.md` - Client-side scripts
  documentation
- **CSS Migration Notes**: `src/styles/CSS_MIGRATION_NOTES.md` - CSS migration
  details
- **Agent Instructions**: `AGENTS.md` - Development workflow and issue tracking

## 🤝 Contributing

1. Check available work: `bd ready`
2. Claim an issue: `bd update <id> --status in_progress`
3. Make your changes
4. Run quality checks: `bun run check && bun run lint`
5. Complete the issue: `bd close <id>`
6. Push changes: `git push`

## 📄 License

[Add license information if applicable]

## 🔗 Links

- **Website**: [jobnagringa.com.br](https://jobnagringa.com.br)
- **Astro Documentation**: [docs.astro.build](https://docs.astro.build)
- **Clerk Documentation**: [clerk.com/docs](https://clerk.com/docs)
- **Issue Tracking**: Use `bd` commands (see AGENTS.md)

## 📞 Support

For issues and questions:

- Check existing issues: `bd ready`
- Create new issues using beads tracking system
- Review migration documentation for migration-related questions

---

**Note**: This project is in active migration. Legacy files are preserved in
`src-legacy/` for reference during the migration process.
