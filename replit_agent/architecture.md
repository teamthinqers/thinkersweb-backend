# Architecture Overview

## 1. Overview

DotSpark is a full-stack web application designed as a learning management system that allows users to capture, organize, and share learning experiences. The application features a modern architecture with a clear separation between frontend and backend components. It's built using React for the frontend UI and Express.js for the backend API, with PostgreSQL (via Neon) as the database.

The application incorporates several integration points, including WhatsApp for remote data entry, Google Firebase for authentication, and OpenAI for natural language processing of learning entries.

## 2. System Architecture

### 2.1 High-Level Architecture

DotSpark follows a client-server architecture with the following key components:

- **Client**: React-based Single Page Application (SPA)
- **Server**: Express.js REST API
- **Database**: PostgreSQL (Neon Database serverless)
- **ORM**: Drizzle ORM for type-safe database access
- **Authentication**: Dual authentication system with session-based auth and Firebase auth

```
┌─────────────┐           ┌─────────────┐          ┌─────────────┐
│             │           │             │          │             │
│  React SPA  │◄─────────►│  Express.js │◄────────►│  PostgreSQL │
│  (Client)   │   REST    │   (Server)  │  Drizzle │  (Database) │
│             │    API    │             │    ORM   │             │
└─────────────┘           └──────┬──────┘          └─────────────┘
                                 │
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
          ┌───────▼────┐  ┌──────▼─────┐  ┌─────▼──────┐
          │            │  │            │  │            │
          │  Firebase  │  │  OpenAI    │  │  Twilio    │
          │  (Auth)    │  │  (NLP)     │  │ (WhatsApp) │
          │            │  │            │  │            │
          └────────────┘  └────────────┘  └────────────┘
```

### 2.2 Data Flow

1. The React SPA sends API requests to the Express.js backend
2. The Express.js backend authenticates requests using sessions or Firebase tokens
3. Validated requests are processed, often involving database operations
4. The Drizzle ORM handles database interactions with PostgreSQL
5. External services (OpenAI, Twilio) are called as needed for specific features
6. Results are returned to the client as JSON responses

## 3. Key Components

### 3.1 Frontend Architecture

The frontend is a React-based SPA with the following key technologies and patterns:

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state, React Context for auth state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: A component hierarchy with feature-specific components

Key frontend directories:
- `/client/src/components`: UI components organized by feature
- `/client/src/pages`: Main application pages/views
- `/client/src/hooks`: Custom React hooks including data fetching
- `/client/src/lib`: Utility functions and service integrations

### 3.2 Backend Architecture

The backend is an Express.js REST API with the following architecture:

- **Framework**: Express.js with TypeScript
- **API Layer**: RESTful API endpoints in `server/routes.ts`
- **Authentication**: Passport.js with local strategy and Firebase integration
- **Database Access**: Drizzle ORM with PostgreSQL
- **External Integrations**: OpenAI, Twilio WhatsApp

Key backend directories:
- `/server`: Express application, route definitions, authentication
- `/shared`: Shared types and database schema definitions
- `/db`: Database connection and migration logic

### 3.3 Database Schema

The database schema is defined using Drizzle ORM with the following core entities:

- **Users**: User accounts with auth information and profiles
- **Entries**: Learning entries created by users
- **Categories**: Categorization system for entries
- **Tags**: Tagging system for entries
- **Connections**: Social connections between users
- **SharedEntries**: Entries shared between users

Relationships:
- Users have many Entries
- Users have many Connections with other Users
- Entries can have multiple Tags
- Entries belong to a Category
- Entries can be shared with multiple Users

### 3.4 Authentication System

The application uses a dual authentication approach:

1. **Session-based authentication**:
   - Express sessions stored in PostgreSQL
   - Password hashing with scrypt
   - Session management with cookie-based auth

2. **Firebase Authentication**:
   - Google OAuth integration
   - Firebase for social auth providers
   - Token verification on the backend

Users can authenticate via traditional username/password or through Google sign-in.

## 4. External Dependencies

### 4.1 External Services

The application integrates with several external services:

- **Neon Database**: Serverless PostgreSQL for data storage
- **Firebase**: Authentication and user management
- **OpenAI**: Natural language processing for chat-based entry creation
- **Twilio**: WhatsApp integration for capturing learning on mobile

### 4.2 Key NPM Dependencies

- **Frontend**:
  - React and React DOM
  - Tailwind CSS and shadcn/ui components
  - React Query for data fetching
  - Recharts for data visualization
  - Wouter for routing
  - Zod for validation

- **Backend**:
  - Express.js for API server
  - Drizzle ORM for database access
  - Passport.js for authentication
  - OpenAI SDK for AI integration
  - Twilio SDK for WhatsApp integration

## 5. API Structure

The API follows RESTful principles with the following key endpoints:

- **Authentication**:
  - `/api/auth/login`: Login with username/password
  - `/api/auth/google`: Google authentication
  - `/api/auth/logout`: Session logout

- **User Management**:
  - `/api/user`: User profile operations
  - `/api/connections`: Social connections

- **Entries**:
  - `/api/entries`: CRUD operations for learning entries
  - `/api/entries/favorite`: Favorite entries
  - `/api/entries/search`: Search entries

- **Categories & Tags**:
  - `/api/categories`: Category management
  - `/api/tags`: Tag management

- **Analytics**:
  - `/api/analytics/frequency`: Entry frequency analysis
  - `/api/analytics/categories`: Category distribution
  - `/api/insights`: Learning insights

- **WhatsApp Integration**:
  - `/api/whatsapp/register`: Register phone for WhatsApp
  - `/api/whatsapp/verify`: Verify OTP code
  - `/api/whatsapp/status`: Check WhatsApp connection status

## 6. Deployment Strategy

The application is designed to be deployed on Replit, with the following configuration:

- **Build Process**: Vite for frontend building, esbuild for backend transpilation
- **Runtime Environment**: Node.js 20
- **Database**: Neon PostgreSQL (serverless)
- **Environment Variables**: Configuration via `.env` file

The deployment process involves:
1. Building the frontend with Vite
2. Transpiling the backend TypeScript with esbuild
3. Starting the Node.js server which serves both the API and static frontend files

Development and production environments are differentiated through the `NODE_ENV` environment variable, which affects error handling, logging, and certain middleware configurations.

## 7. Future Considerations

The architecture has several areas that could be enhanced in future iterations:

1. **Scalability**: While the current architecture works well for moderate user loads, horizontal scaling might require additional considerations like stateless authentication and load balancing.

2. **Real-time Features**: The current architecture doesn't include real-time functionality. Adding WebSockets or a similar technology would enhance collaborative features.

3. **Microservices**: The monolithic architecture could eventually be split into microservices for better separation of concerns and independent scaling.

4. **Enhanced Analytics**: The analytics capabilities could be expanded with dedicated analytics services or integrations with specialized analytics platforms.