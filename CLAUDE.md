# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start Next.js development server on http://localhost:3000
- `npm run build` - Build for production (runs Prisma generate then Next.js build)
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run format` - Format code with Prettier

### Database

- `npx prisma generate` - Generate Prisma client and Zod types
- `npx prisma migrate dev` - Create and apply migrations in development
- `npx prisma db seed` - Seed database (uses `prisma/seed.ts`)
- `npx prisma studio` - Launch Prisma Studio for database inspection

## Architecture

### Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **UI**: Chakra UI v2, SaaS UI v2, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **State Management**: TanStack React Query v5
- **Tables**: TanStack React Table v8
- **Validation**: Zod with auto-generated Prisma types
- **Monitoring**: LogRocket

### Key Structure

**Database Models** (defined in `prisma/schema.prisma`):

- `Account`: User accounts with roles (DEV, ADMIN, COORDINATOR, FOREMAN)
- `Timesheet`: Weekly timesheets (ID format: "YYYY-MM-DD" for week ending)
- `Employee`: Workers linked to timesheets with rates and contact info
- `Job`: Projects with budgets and labor tracking (PRIVATE, STATE, FEDERAL types)
- `Day`: Daily records per job with descriptions
- `Entry`: Time entries for employees on specific job days
- `Action`: Audit log for all system changes

**Application Flow**:

1. Root layout (`src/app/layout.tsx`) automatically creates weekly timesheets
2. Authentication handled by Clerk middleware (`src/middleware.ts`)
3. Pages use server components with direct Prisma queries
4. Client components in `src/components/` handle interactivity
5. API routes in `src/app/api/` for webhooks and cron jobs

**Key Patterns**:

- Server components fetch data directly with Prisma
- Client mutations use React Query with server actions
- Audit logging tracks all data changes via Action model
- Phone notifications sent via Twilio for timesheet confirmations
- Excel export functionality for payroll records
