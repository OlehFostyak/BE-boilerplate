# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run local` - Start development server with nodemon and tsconfig-paths
- `npm run local:env` - Start local Docker Compose environment with PostgreSQL
- `npm run build` - Clean dist folder and build TypeScript to production
- `npm run production` - Run production build from dist folder
- `npm run lint` - Run ESLint on entire codebase
- `npm run lint:fix` - Run ESLint with auto-fix

### Database Operations
- `npm run db:migration:run` - Apply Drizzle migrations to database
- `npm run db:migration:generate` - Generate new Drizzle migration files
- `npm run db:migration:studio` - Open Drizzle Studio for database inspection

### Seeding Data
- `npm run seed:posts` - Seed database with sample posts
- `npm run seed:comments` - Seed database with sample comments  
- `npm run seed:tags` - Seed database with sample tags
- `npm run seed:post-tags` - Assign tags to existing posts

## Architecture Overview

This is a Fastify-based REST API with TypeScript, Drizzle ORM, PostgreSQL, and AWS Cognito authentication.

### Key Architectural Patterns

**Repository Pattern**: Database operations are abstracted through repository classes in `src/repos/` that provide clean interfaces for data access.

**Controller-Service Architecture**: Business logic is separated into controllers (`src/controllers/`) with services handling external integrations (AWS, SendGrid).

**Schema-First API Design**: All API endpoints use Zod schemas for request/response validation located in `src/api/routes/schemas/`.

**Plugin-Based Middleware**: Fastify plugins handle cross-cutting concerns (auth, logging, error handling) in `src/api/plugins/`.

### Database Schema
Core entities with UUID primary keys and proper foreign key relationships:
- **Users** (with Cognito integration)
- **Posts** (belong to users)
- **Comments** (belong to posts and users)
- **Tags** (many-to-many with posts via post_tags junction table)

### Authentication Flow
Uses AWS Cognito for authentication with custom hooks:
- `authHook` - Validates JWT tokens and decorates requests with user data
- `adminOnly` - Restricts admin routes to admin role users
- Authentication bypassed for `/api/documentation` routes

### Environment Configuration
All environment variables are validated through `EnvSchema.ts` using Zod. Required AWS credentials for Cognito and general database configuration.

### Route Organization
Routes follow RESTful patterns with automatic loading:
- `/api/posts` - CRUD operations for posts
- `/api/comments` - Comment management
- `/api/tags` - Tag management  
- `/api/admin` - Admin-only operations (users, tags)
- `/api/auth` - Authentication endpoints

### Error Handling
Centralized error handling through custom error classes and HTTP error responses with proper status codes and error messages.

## Development Setup Requirements

1. Node.js >= 22.0.0
2. PostgreSQL database (local or Docker)
3. AWS Cognito User Pool configured
4. Environment variables set according to EnvSchema
5. Run migrations before starting development
6. Use Docker Compose for local PostgreSQL instance