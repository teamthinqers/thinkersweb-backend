# DotSpark - Learning Management System with Neural Extensions

## Overview

DotSpark is a full-stack web application that serves as a personalized learning management system with "neural extension" capabilities. The platform allows users to capture, organize, and share learning experiences while providing AI-powered insights and natural language processing of entries. The application emphasizes preserving users' natural intelligence while enhancing their cognitive capabilities through tunable AI assistance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state, React hooks for local state
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite with custom plugins for Replit integration
- **PWA Support**: Service worker implementation with offline capabilities

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Dual system with Passport.js session-based auth and Firebase authentication
- **Session Storage**: PostgreSQL session store using connect-pg-simple
- **API Design**: RESTful API with structured endpoints for entities
- **Middleware**: Custom authentication, CORS, and usage limiting middleware

### Database Architecture
- **Database**: PostgreSQL (Neon Database serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Core Entities
1. **Users**: Enhanced user profiles with Firebase UID support, bio, avatar
2. **Entries**: Learning entries with categories, tags, visibility settings
3. **Categories**: Professional, Personal, Health, Finance with color coding
4. **Tags**: Flexible tagging system for content organization
5. **Connections**: User-to-user connections for sharing and networking
6. **Shared Entries**: Entry sharing system with permission levels

### AI/Neural Extensions
1. **DotSpark Core**: Tunable AI assistant with cognitive parameters
2. **CogniShield**: Cognitive alignment monitoring and correction system
3. **Neural Processing**: OpenAI integration for content analysis and generation
4. **Chat Interface**: Conversational AI for entry creation and insights

### WhatsApp Integration
1. **Webhook System**: Twilio and Meta WhatsApp Business API support
2. **Message Processing**: Natural language processing of WhatsApp messages
3. **User Registration**: Phone number verification and user linking
4. **Automated Responses**: AI-generated contextual responses

### Authentication System
1. **Session-based Auth**: Traditional username/password with session management
2. **Firebase Auth**: Google OAuth integration with Firebase
3. **Dual User Support**: Handles both authentication methods seamlessly
4. **Protected Routes**: Middleware-based route protection

## Data Flow

### Entry Creation Flow
1. User inputs learning content via web interface or WhatsApp
2. Content is processed through OpenAI for structuring and enhancement
3. Entry is stored in database with associated categories and tags
4. Real-time updates are reflected in the dashboard

### WhatsApp Message Flow
1. WhatsApp webhook receives message from Twilio/Meta
2. Phone number is validated against registered users
3. Message content is processed using OpenAI
4. Structured entry is created in database
5. Contextual response is generated and sent back

### Authentication Flow
1. User can authenticate via traditional login or Google OAuth
2. Sessions are stored in PostgreSQL for persistence
3. Firebase authentication is integrated for Google sign-in
4. User context is maintained across requests

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4 for content processing and generation
- **Neon Database**: Serverless PostgreSQL hosting
- **Firebase**: Authentication and user management
- **Twilio**: WhatsApp Business API (legacy support)
- **Meta Graph API**: WhatsApp Business API (primary)

### Development Tools
- **Vite**: Build tool with development server
- **Drizzle Kit**: Database migration and management
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form management with validation

## Deployment Strategy

### Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development
- **Hot Module Replacement**: Vite HMR for rapid development
- **Environment Variables**: Secure credential management
- **Database Seeding**: Automated test data generation

### Production Environment
- **Build Process**: Vite production build with optimizations
- **Static Serving**: Express serves built assets
- **Session Persistence**: PostgreSQL session storage
- **Error Handling**: Comprehensive error boundaries and logging

### Infrastructure
- **Autoscale Deployment**: Replit autoscale deployment target
- **Database**: Neon serverless PostgreSQL
- **CDN**: Static asset optimization
- **Monitoring**: Built-in health checks and logging

## Changelog
```
Changelog:
- June 13, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```