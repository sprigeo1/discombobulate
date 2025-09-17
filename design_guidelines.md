# Discombobulate Design Guidelines

## Design Approach: Utility-Focused Design System
**Selected System:** Material Design with community-focused customizations
**Justification:** Educational platforms require trust, accessibility, and clear information hierarchy. Material Design's emphasis on clarity and systematic approach aligns with institutional needs while allowing warm customization.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light mode: 200 65% 45% (warm teal for trust and growth)
- Dark mode: 200 35% 25% (muted teal for comfort)

**Background Colors:**
- Light mode: 45 15% 96% (warm off-white)
- Dark mode: 220 15% 12% (deep blue-gray)

**Accent Colors:**
- Success/Growth: 140 60% 50% (encouraging green)
- Warning/Attention: 25 85% 55% (warm orange)

### Typography
**Font Family:** Inter (Google Fonts) for clarity and accessibility
**Hierarchy:**
- Headings: 600-700 weight, larger scales for assessment titles
- Body text: 400-500 weight, optimized for form readability
- Micro-ritual cards: 500 weight for actionability

### Layout System
**Spacing Units:** Tailwind units of 3, 4, 6, and 8
- Forms and cards: p-6, gap-4
- Section spacing: mb-8, mt-6
- Component padding: p-3, p-4

### Component Library

**Assessment Forms:**
- Multi-step progress indicators with warm color fills
- Question cards with rounded corners (rounded-lg)
- Radio buttons and checkboxes with custom community-themed styling
- Clear section breaks between relationship categories

**Results Dashboard:**
- Relationship strength visualizations using soft, non-alarming colors
- Card-based layout for different relationship metrics
- Gentle progress bars avoiding red/negative associations

**Micro-Ritual Suggestions:**
- Actionable cards with clear typography and gentle shadows
- Category-based filtering (student-student, staff-student, etc.)
- Implementation difficulty indicators using friendly iconography

**Navigation:**
- Role-based menu systems with clear visual differentiation
- Breadcrumb navigation for multi-step processes
- Accessible tab systems for switching between assessment areas

**Data Visualization:**
- Relationship network diagrams using warm, connecting colors
- Community health metrics with positive, growth-oriented styling
- School-wide progress tracking with encouraging visual feedback

### Visual Principles
**Community-Centered Approach:**
- Soft, rounded corners throughout to reduce institutional feeling
- Generous whitespace to reduce anxiety and promote reflection
- Warm color temperature to encourage openness and trust
- Non-judgmental visual language avoiding stark contrasts or alarm colors

**Accessibility Focus:**
- High contrast ratios for all text combinations
- Clear focus indicators for keyboard navigation
- Consistent dark mode implementation across all components
- Font sizing that accommodates various reading abilities

**Trust-Building Elements:**
- Subtle card elevations using soft shadows
- Gentle transitions between form steps
- Progress indicators that celebrate completion rather than pressure
- Visual consistency that builds familiarity and comfort

### Images
**Hero Section:** No large hero image - focus on clear value proposition text and gentle background gradients
**Micro-Ritual Cards:** Small illustrative icons (sourced from Heroicons) representing different relationship-building activities
**Dashboard Elements:** Simple, friendly data visualization graphics using the established color palette