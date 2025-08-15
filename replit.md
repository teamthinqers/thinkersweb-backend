# DotSpark

## Overview
DotSpark is a full-stack web application serving as a personalized learning management system with "neural extension" capabilities. It allows users to capture, organize, and share learning experiences, offering AI-powered insights and natural language processing of entries. The platform is designed to preserve natural intelligence while enhancing cognitive capabilities through tunable AI assistance. Key capabilities include comprehensive entity management (users, entries, categories, tags, connections), advanced AI/Neural Extensions (DotSpark Core, CogniShield, Neural Processing via OpenAI, conversational AI), and WhatsApp integration for seamless content capture. The project aims to provide a unique, AI-enhanced learning experience with significant market potential for personalized cognitive augmentation.

## User Preferences
Preferred communication style: Simple, everyday language.
Dot creation: User prefers no automatic AI processing of their inputs - preserve exact text as provided.
Dot headings: Automatic AI-generated headings are acceptable and should remain enabled.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query (server state), React hooks (local state)
- **UI Components**: Radix UI with shadcn/ui
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **PWA Support**: Service worker with offline capabilities

### Backend
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js (session-based) and Firebase authentication
- **Session Storage**: PostgreSQL session store
- **API Design**: RESTful API
- **Middleware**: Custom authentication, CORS, usage limiting
- **Python Integration**: Automatic detection and integration of new Python logic files.

### Database
- **Database**: PostgreSQL (Neon Database serverless)
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Connection**: @neondatabase/serverless for pooling

### Key Features and Design Decisions
- **Core Entities**: Users, Entries, Categories, Tags, Connections, Shared Entries.
- **AI/Neural Extensions**: Tunable AI (DotSpark Core), cognitive alignment (CogniShield), content analysis/generation (OpenAI), conversational AI for entry creation, and automatic Python logic integration.
- **WhatsApp Integration**: Twilio/Meta WhatsApp Business API for message processing, user registration, and automated responses.
- **Authentication System**: Supports both traditional session-based and Firebase Google OAuth, with dual user support and protected routes.
- **Data Flow**: Structured flows for entry creation (web/WhatsApp to OpenAI to DB), WhatsApp message processing, and authentication management.
- **UI/UX Decisions**:
    - **Color Schemes**: Amber/orange theme for cognitive elements (dots, wheels, chakras), purple for AI-related functionality, red-orange for social features.
    - **Dynamic Grid Sizing**: Adaptive sizing for dots, wheels, and chakras based on content quantity, with dynamic spacing and content-aware boundaries.
    - **Visual Hierarchy**: Gradients and animations (e.g., rotating rings for chakras, pulsing dots) to distinguish elements and enhance engagement.
    - **Mobile Optimization**: Responsive layouts, sticky headers, optimized spacing, and compact components for seamless mobile experience.
    - **Chat Interface**: ChatGPT-style collapsed sidebar, professional polish with gradients, optimized message density, and typewriter effects.
    - **PWA**: Streamlined capture interface, persistent floating dot with drag-and-drop, and seamless integration with the main app.
    - **Cognitive Structure Classification**: Strict AI classification for dots (single insights), wheels (goal-oriented), and chakras (life purpose), with guided conversation flows.
    - **Gamification**: Progress meters with motivational elements for dot creation.
    - **One-Word Summary & Flash Cards**: Automated generation of keywords for quick content identification.
    - **Spark-Based Grouping**: Replaces the 9-dot wheel concept, allowing dots to belong to multiple "sparks" for cross-insight generation.

## External Dependencies

### Core Services
- **OpenAI API**: For GPT-4 (content processing, generation, classification, intelligence), Whisper (voice-to-text).
- **Neon Database**: Serverless PostgreSQL hosting.
- **Firebase**: Authentication and user management.
- **Twilio**: WhatsApp Business API (legacy support).
- **Meta Graph API**: WhatsApp Business API (primary).
- **Pinecone**: Vector database for semantic search and conversation memory.

### Development Tools
- **Vite**: Build tool.
- **Drizzle Kit**: Database migration.
- **TypeScript**: Type safety.
- **ESLint/Prettier**: Code quality.

### UI/UX Libraries
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **Tailwind CSS**: Utility-first CSS framework.
- **React Hook Form**: Form management.