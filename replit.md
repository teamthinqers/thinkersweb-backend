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
- June 13, 2025. Updated DotSpark logo implementation:
  * Added new logo icon (dotspark-logo-icon.jpeg) to public directory
  * Updated PWA header with icon + "DotSpark" text layout
  * Increased MyNeura page header logo size to h-12 w-12
  * Updated MyDotSpark status section logos with new icon
  * Enhanced Dashboard DotSparkSummary component with new logo icon
- June 13, 2025. Updated PWA configuration:
  * Set PWA app name to "DotSpark" (both name and short_name)
  * Implemented user's specific brown background logo as app icon
  * Updated CogniShield description to emphasize cognitive identity preservation
- June 13, 2025. Final PWA icon implementation:
  * Used exact user-provided brown logo with white "d" symbol (dot_spark_logo-03_1749842817686.jpg)
  * Converted to PNG format for optimal PWA compatibility
  * Updated manifest.json and favicon references to dotspark-pwa-final.png
  * Added cache-busting parameters to force browser refresh
- June 14, 2025. Fixed dashboard navigation issues:
  * Header logo and "DotSpark" text now navigate to My Neura page (/my-neura) instead of dashboard
  * Hamburger menu "Home" link now correctly navigates to home page (/) instead of dashboard
  * Updated sidebar branding with proper DotSpark logo icons
- June 14, 2025. Resolved WhatsApp popup warnings:
  * Converted all WhatsApp buttons from JavaScript handlers to direct HTML links
  * Eliminated browser popup blocker warnings by using standard link navigation
  * Removed unnecessary PWA permission system that was causing build complexity
  * Fixed all remaining window.open() calls in WhatsApp components:
    - DotSparkWhatsAppLinking.tsx: Converted to window.location.href
    - NeuralWhatsAppLinking.tsx: Converted to window.location.href
    - WhatsAppPromo.tsx: Converted to window.location.href
    - ContactOptionsDialog.tsx: Converted to window.location.href
    - CompactWhatsAppButton.tsx: Already using proper navigation
- June 14, 2025. Dot Settings section updates:
  * Replaced capacity metrics with Dot Settings component using settings icon
  * Updated description to "Configure your dot capture settings"
  * Implemented automatic floating dot activation when DotSpark is enabled (no separate toggle)
  * Added Voice Only, Text Only, and Hybrid Mode selection interface with enhanced UX
  * Renamed section heading from "Dot capture status" to "Floating dot"
  * Created premium visual mode selection cards with gradients, animations, and checkmark indicators
  * Final rename from "DotSpark Settings" to "Dot Settings" for cleaner branding
- June 14, 2025. Homepage call-to-action updates:
  * Updated step 2 text from "Activate your DotSpark" to "Activate the Dot to capture your valuable thoughts"
  * Updated step 2 button from "Activate DotSpark" to "Activate Dot"
  * Updated step 2 description from "Configure your DotSpark to mirror your natural intelligence & thinking style" to "Configure the Dot settings to capture your valuable thoughts"
  * Improved messaging alignment with dot-focused branding and value proposition
- June 14, 2025. Enhanced floating dot with logo integration and PWA optimization:
  * Replaced circle icon with DotSpark logo icon (/dotspark-pwa-final.png)
  * Added comprehensive mobile touch support for dragging functionality
  * Enhanced PWA compatibility with higher z-index and better positioning
  * Improved accessibility with proper ARIA labels and keyboard support
  * Added window resize handling and viewport boundary constraints
  * Optimized for home screen PWA usage with persistent positioning
- June 14, 2025. Unified DotSpark PWA installation solution:
  * Created dedicated /dot route with streamlined capture interface
  * Implemented choice-based UI: voice capture, text input, or access full app
  * Eliminated dual installation complexity - users install one "DotSpark" PWA
  * Added seamless transition option to full DotSpark experience when needed
  * Set PWA start_url to /dot so users immediately see capture interface upon installation
  * PWA installs as "DotSpark" with focused thought capture as entry point
- June 14, 2025. Persistent floating dot for desktop browser users:
  * Created GlobalFloatingDot component that persists across all website pages
  * Automatically appears when DotSpark is activated for laptop/desktop browser users
  * Maintains draggable position using localStorage for consistent placement
  * Provides voice and text capture options directly from any page
  * Excludes PWA standalone mode to avoid conflicts with dedicated PWA experience
  * Uses actual DotSpark logo as the floating dot icon for brand consistency
- June 14, 2025. Enhanced DotSpark PWA dot screen user experience:
  * Fixed logo display issues with fallback image handling
  * Updated branding from "Your Dot" to "DotSpark" with brown gradient theme
  * Enhanced description to "Capture your thoughts/insights as dots instantly"
  * Simplified button labels to "Voice" and "Text" for clarity
  * Renamed access button to "Open DotSpark App"
  * Added "My Neura" button as placeholder for future navigation functionality
- June 14, 2025. Refined DotSpark PWA dot screen interface design:
  * Removed white circular background from logo for cleaner appearance
  * Updated main question to "How would you like to capture your Dots?"
  * Enhanced header description to "Capture your Thoughts/Insights as Dots instantly"
  * Removed "Swipe up for more options" instruction for streamlined experience
  * Added value proposition text: "Your valuable thoughts are stored as connected dots to spark progressive insights"
- June 14, 2025. Enhanced DotSpark PWA capture interface usability:
  * Removed spark symbol from voice and text screens, replaced with back arrow for navigation
  * Updated button text from "Save Thought" to "Save Dot" for brand consistency  
  * Added backspace functionality to both voice and text screens with arrow button
  * Optimized neuraStorage polling to eliminate excessive console logging
- June 14, 2025. Enhanced DotSpark PWA navigation button experience:
  * Redesigned "Open DotSpark App" and "My Neura" buttons with gradient backgrounds
  * Added two-line layout with descriptive subtitles for better user understanding
  * Implemented proper navigation functionality for My Neura button
  * Enhanced visual hierarchy with larger icons and improved spacing
  * Added smooth hover transitions and brand-specific color schemes
- June 14, 2025. Cleaned up Dot Settings interface:
  * Removed floating dot active status button and indicators from Dot Settings section
  * Removed "Level 1" tag from Dot Settings header for cleaner appearance
  * Simplified Dot Settings to focus purely on capture mode configuration
  * Updated header layout to show only Settings icon and title without status badges
- June 14, 2025. Enhanced DotSpark PWA capture interface navigation:
  * Added backspace buttons at the top of both voice and text capture sections
  * Removed redundant backspace button from bottom action bar for cleaner interface
  * Made "Save Dot" button full width for improved usability
  * Enhanced text button with blue gradient background matching voice button quality
  * Fixed navigation button readability issues preventing white text on click
  * Improved button styling with consistent color schemes and hover states
- June 14, 2025. Fixed floating dot logo visibility and PWA interface consistency:
  * Updated floating dot to use actual DotSpark logo from attached_assets for clear visibility
  * Changed all "Capture Thought" text to "Save a Dot" throughout floating dot interface
  * Updated question text from "How would you like to capture your thought" to "How would you like to capture your Dot?"
  * Aligned Voice and Text button colors to match PWA interface with amber/orange gradients
  * Enhanced cross-page floating dot availability with improved activation detection
  * Applied consistent logo styling with white background and proper fallback mechanisms
  * Fixed duplicate dots issue in mobile browser by separating desktop and PWA rendering
  * Created dedicated PWAFloatingDot component for standalone PWA mode with cross-page availability
  * Updated save button text from "Save Dot" to "Save a Dot" for consistency across all interfaces
- June 14, 2025. Final floating dot logo and duplicate cleanup:
  * Updated floating dot to use only brown circular dot logo instead of full logo element
  * Removed duplicate FloatingDot component from DotSparkSettings that caused double dots on Neural page
  * Changed logo above "Save a Dot" heading from white background full logo to circular dot icon only
  * Achieved consistent circular dot icon usage throughout all floating dot interfaces
- June 14, 2025. Updated PWA DotSpark interface logo:
  * Changed logo above "DotSpark" heading in PWA interface from full logo to icon-only version
  * Now uses dotspark-icon-only.jpeg for cleaner, consistent branding
  * Maintains circular dot icon theme throughout PWA capture interface
- June 14, 2025. Optimized floating dot performance:
  * Reduced activation polling frequency from 1 second to 5 seconds for better performance
  * Removed excessive console logging from DotSpark activation checks
  * Improved overall application performance and console cleanliness
- June 14, 2025. Simplified floating dot design:
  * Replaced all logo images with pure CSS design: brown gradient circle with white center dot
  * Added blinking animation with animate-pulse for visual feedback
  * Eliminated image loading complications and fallback handling
  * Achieved consistent brown background with solid white dot across all floating dot interfaces
- June 14, 2025. Updated PWA navigation to external DotSpark URLs:
  * "Open DotSpark App" button redirects to https://www.dotspark.in/my-neura
  * "My Neura" and "Access Neura" buttons redirect to https://www.dotspark.in/dashboard
  * All navigation buttons open external URL in new tab using window.open() with _blank target
  * PWA interface now seamlessly connects users to the appropriate DotSpark application pages
- June 14, 2025. Updated home page "Activate DotSpark" step 2 icon:
  * Replaced previous image with DotSpark logo icon (/dotspark-logo-icon.jpeg)
  * Applied rounded-full styling for circular appearance matching DotSpark branding
  * Maintains consistency with step 2 orange theme in the 3-step setup process
- June 14, 2025. Fixed floating dot visibility in PWA mode:
  * Removed PWA mode restriction from GlobalFloatingDot component
  * Floating dot now appears consistently in both web browser and PWA standalone modes
  * Users can access the blinking dot functionality across all environments when DotSpark is activated
- June 14, 2025. Updated home page "Explore DotSpark Neura" button:
  * Changed from internal navigation (/neura) to external redirect to https://www.dotspark.in/dashboard
  * Button now opens dashboard in new tab for seamless access to full application features
- June 14, 2025. Enhanced floating dot positioning and visibility:
  * Fixed missing logo by updating to use existing dotspark-logo-icon.jpeg with fallback
  * Changed default position to appear near activation section (x: 320, y: 180) for better visibility
  * Added special positioning logic for first-time activation to place dot near activation area
  * Enhanced visual appearance with amber gradient background and improved shadows
  * Added subtle pulse animation for newly activated dots that stops after first interaction
- June 14, 2025. Implemented global floating dot with PWA-style interface:
  * Enhanced floating dot to provide same experience as PWA dot interface across all website pages
  * Updated expanded interface with large logo, gradient buttons, and enhanced typography
  * Voice capture now features large 20x20 recording button with proper visual feedback
  * Text capture includes enhanced text area with amber focus styling and rounded corners
  * Save button redesigned with full-width amber gradient matching PWA style
  * Dot remains draggable and accessible on all pages when DotSpark is activated
- June 14, 2025. Updated DotSpark PWA color theme and navigation:
  * Changed Text button background from blue to amber/orange gradient matching logo theme
  * Updated My Neura button to use amber/orange colors instead of blue
  * Renamed "Open DotSpark App" to "Access Neura" in capture sections
  * Updated all navigation buttons to direct users to dashboard (/) for streamlined experience
  * Achieved unified branding with consistent amber/orange color scheme throughout interface
  * Updated "Open DotSpark App" button to navigate to My Neura page for full neural features access
  * Fixed "My Neura" and "Access Neura" buttons to properly navigate to My Neura page (/my-neura) instead of home page
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```