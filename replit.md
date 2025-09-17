# Discombobulate

## Overview

Discombobulate is a school community relationship assessment platform designed to measure and strengthen connections within educational institutions. The application helps schools assess relationship dynamics between different community members (students, staff, administrators, counselors) and provides actionable micro-ritual suggestions to enhance community bonds and improve school safety through connection.

The platform features a multi-step assessment system that captures relationship strength data across various categories, presents visual analytics of community health, and recommends targeted interventions through micro-rituals. It emphasizes trust-building, accessibility, and gentle guidance rather than punitive measures.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture:**
- React 18 with TypeScript for type safety and modern development practices
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query for server state management and data fetching
- Tailwind CSS with custom design system based on Material Design principles
- Shadcn/ui component library with Radix UI primitives for accessible, customizable components

**Backend Architecture:**
- Express.js server with TypeScript for API endpoints
- RESTful API design with clear resource-based routing
- In-memory storage implementation (MemStorage) as the data layer interface
- Modular route handling with separation of concerns
- Session management using connect-pg-simple (prepared for PostgreSQL sessions)

**Data Storage:**
- Drizzle ORM configured for PostgreSQL with schema-first approach
- Database schema includes schools, users, questions, responses, micro-rituals, and completion tracking
- UUID-based primary keys for scalability
- JSONB fields for flexible data structures (question options, ritual steps)

**Component Design System:**
- Material Design foundation with community-focused customizations
- Warm color palette emphasizing trust and growth (teal primary, soft backgrounds)
- Typography using Inter font for clarity and accessibility
- Card-based layouts with consistent spacing (Tailwind units 3, 4, 6, 8)
- Multi-step forms with progress indicators and gentle validation
- Non-alarming color schemes avoiding red/negative associations

**Assessment Flow:**
- Role-based question filtering (student, staff, administrator, counselor)
- Progressive form with navigation controls and answer persistence
- Category-based organization of relationship metrics
- Response validation and submission handling
- Cooldown period enforcement between assessments

**Analytics and Visualization:**
- Relationship strength scoring across multiple categories
- Trend tracking (up/down/stable indicators)
- Progress visualization with custom charts
- Milestone tracking and goal setting
- Historical score comparison

## External Dependencies

**Core Framework Dependencies:**
- React ecosystem: @tanstack/react-query, wouter for routing
- Radix UI components for accessibility and customization
- Lucide React for consistent iconography

**Database and ORM:**
- Drizzle ORM with PostgreSQL dialect
- @neondatabase/serverless for database connectivity
- Zod for schema validation and type inference

**Development and Build Tools:**
- Vite with React plugin for development server and build process
- TypeScript for type checking across client, server, and shared code
- ESBuild for server-side bundling
- Tailwind CSS with PostCSS processing

**UI and Styling:**
- Tailwind CSS with custom configuration
- Class Variance Authority for component variant management
- Tailwind Merge for class conflict resolution
- Google Fonts (Inter, DM Sans, Architects Daughter) for typography

**Server Dependencies:**
- Express.js for HTTP server and API routing
- Connect-pg-simple for PostgreSQL session storage
- Date-fns for date manipulation and formatting

**Form and Validation:**
- React Hook Form with Hookform Resolvers
- Zod integration for runtime validation
- Custom form components with accessibility features