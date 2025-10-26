# DotSpark Android Mobile App - Design Guidelines

## Design Approach

**Framework**: Material Design adapted for existing DotSpark brand identity
**Strategy**: Mobile-first adaptation of dotspark.in web application maintaining visual parity while optimizing for native Android patterns and gestures

## Typography System

**Primary Font**: Roboto (Android native)
**Hierarchy**:
- App Title/Headers: Roboto Medium, 24sp
- Tab Labels: Roboto Medium, 14sp
- Section Titles: Roboto Medium, 18sp
- Body Text: Roboto Regular, 16sp
- Metadata/Captions: Roboto Regular, 12sp
- Button Text: Roboto Medium, 14sp
- Neural Strength Display: Roboto Bold, 32sp

## Layout & Spacing System

**Tailwind Units**: Consistent use of 2, 4, 6, 8, 12, 16, 24 for spacing
**Screen Padding**: px-4 (16dp) standard horizontal margins
**Component Spacing**: mb-6 between major sections, mb-4 between related elements
**Card Padding**: p-4 for standard cards, p-6 for feature cards
**Safe Areas**: Account for Android status bar (24dp) and navigation bar handling

## Navigation Architecture

**Bottom Tab Bar**:
- Fixed bottom position with elevation shadow
- 4 equal-width tabs: MyDotSpark | MyNeura | Social | ThinQCircle
- Active tab indicator: 3dp bottom border matching section theme
- Icon + label layout (icon 24dp, label 12sp below)
- Tab height: 56dp minimum touch target
- Ripple effect on tab press (Material standard)

## MyNeura Page Components

### Header Section (py-6, px-4)
- "MyNeura" title (24sp) aligned left
- View toggle (Feed/Cloud) as segmented control top-right
- Toggle dimensions: 32dp height, rounded-full
- Active segment has filled background, inactive is outlined

### Neural Strength Meter (mb-8)
- Circular progress indicator, 200dp diameter, centered
- Stroke width: 16dp
- Inner numerical display (32sp bold) with "Neural Strength" label below (12sp)
- Concentric design with gradient track (amber-to-red as per brand)

### Thought Cloud Visualization

**Cloud View Mode**:
- Tag cloud layout with varying text sizes (14sp to 24sp based on frequency)
- Lightbulb icons (20dp) preceding each thought/dot
- Interactive bubbles with rounded-lg corners
- Organic spacing using flexbox wrap with gap-3
- Minimum touch target: 48dp x 48dp per element

**Feed View Mode**:
- Vertical scrolling list with card-based items
- Card structure: rounded-xl, elevation-2, mb-4
- Each card contains:
  - Lightbulb icon (24dp) left-aligned
  - Thought title (18sp Medium)
  - Metadata row (12sp): timestamp, category tag
  - Optional AI insight badge (purple accent) - rounded-full pill
  - Chevron-right indicator (20dp) for navigation

### AI Features Integration
- AI-powered suggestions: Distinct cards with purple accent border-left (4dp)
- AI icon (spark/star, 20dp) in purple
- "AI Insight" label (12sp) in purple
- Contained within rounded-lg cards with subtle purple background tint

## Component Patterns

### Cards
- Standard: rounded-xl, p-4, elevation-1, mb-4
- Interactive: Add ripple effect, increase elevation-4 on press
- Feature cards: rounded-xl, p-6, elevation-2

### Buttons
- Primary: rounded-lg, px-6, py-3, 14sp Medium text
- When overlaying images: backdrop-blur-md background treatment
- Full-width CTAs: w-full in mobile context
- Icon buttons: 48dp circle minimum for accessibility
- Floating Action Button (FAB): 56dp circle, bottom-right fixed (16dp margins)

### Input Fields
- Rounded-lg borders, px-4, py-3
- Focus state: 2dp border increase
- Label above field (12sp), helper text below (12sp)
- Search bars: rounded-full with leading search icon (20dp)

### Lists & Grids
- Feed Lists: Single column, full-width cards
- Grid Views: 2-column for tablets (grid-cols-2 gap-4)
- Horizontal scrolling carousels: snap-to-start behavior, gap-4

## Screen Layouts

### MyDotSpark Tab
- Hero section with personalized greeting (py-8, px-4)
- Learning progress cards grid (2-column on larger phones)
- Recent activity feed (single column cards)
- Quick action FAB for creating new content

### Social Tab
- Stories/highlights carousel (horizontal scroll, 80dp circles)
- Activity feed (card-based, infinite scroll)
- Interaction buttons: Like/comment/share (40dp touch targets)

### ThinQCircle Tab
- Group cards with preview images (16:9 aspect ratio)
- Member count badges (rounded-full, 8dp padding)
- Join/joined status indicators

## Images & Visual Assets

**Hero/Header Images**: 
- MyDotSpark: Gradient illustration or abstract learning visual (300dp height)
- Group cards: Thumbnail images (80dp square, rounded-lg)
- No traditional hero sections - mobile prioritizes content density

**Iconography**:
- Use Material Icons library via implementation dependency
- Lightbulb: Custom brand icon at 20dp/24dp sizes
- Consistent 24dp size for navigation and action icons
- 16dp for inline metadata icons

## Accessibility & Interaction

- Minimum touch targets: 48dp x 48dp throughout
- Contrast ratios: Maintain WCAG AA standards with amber theme
- Screen reader support: All interactive elements properly labeled
- Haptic feedback on key interactions (thought creation, AI insights)
- Swipe gestures: Pull-to-refresh on feeds, swipe-to-dismiss on cards

## Animations

**Strategic Only**:
- Tab switching: Crossfade transition (200ms)
- Card reveal: Subtle slide-up on scroll (150ms stagger)
- Neural strength meter: Animated fill on mount (800ms ease-out)
- Thought cloud: Gentle pulse on newly added dots (single iteration)
- No parallax, no continuous animations

## Layout Density

- Compact mode for lists: Reduce card padding to p-3, decrease mb to mb-3
- Comfortable mode (default): Specified spacing above
- Responsive breakpoints: Adjust grid columns and padding for tablets (>600dp width)

This mobile design maintains DotSpark's brand identity (amber/orange primary, purple AI accents) while following Android's Material Design patterns for native feel and optimal usability.