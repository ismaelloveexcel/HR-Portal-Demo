# Baynunah HR Pass System - Design Guidelines

## Design Approach
**Selected Framework:** Carbon Design System with enterprise HR customization
**Rationale:** Information-dense productivity application requiring structured data presentation, form-heavy workflows, and professional credibility. Carbon excels at complex enterprise interfaces with clear hierarchy and efficient space utilization.

## Brand Colors (Provided)
- Primary: #0F3D91 (Navy Blue)
- Accent: #0FA958 (Green)
- Supporting neutrals will be defined separately

## Typography System
**Font Family:** IBM Plex Sans (via Google Fonts CDN)
- Headings: 600-700 weight
- Body: 400-500 weight
- UI Elements: 500-600 weight
- Data/Numbers: 500 weight (tabular-nums)

**Scale:**
- Page Titles: text-2xl (1.5rem)
- Section Headers: text-xl (1.25rem)
- Card/Module Titles: text-lg (1.125rem)
- Body/Forms: text-base (1rem)
- Captions/Meta: text-sm (0.875rem)
- Micro-labels: text-xs (0.75rem)

## Layout System
**Spacing Primitives:** Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: py-8 to py-12
- Card margins: mb-4 to mb-6
- Form field gaps: gap-4
- Grid gaps: gap-6 to gap-8

**Container Strategy:**
- App shell: max-w-screen-2xl mx-auto
- Content areas: max-w-6xl
- Forms: max-w-2xl
- Data tables: w-full with horizontal scroll

## Component Library

### Navigation
**Top Bar:** Fixed header with logo, global search, notifications, user menu
**Side Navigation:** Persistent sidebar (200px) with hierarchical menu structure, active state highlighting

### Data Display
**Tables:** Striped rows, sortable headers, pagination, row actions menu, sticky headers for long lists
**Cards:** Elevated containers (shadow-md) with header/body/footer structure, used for candidate profiles, request summaries
**Status Badges:** Pill-shaped indicators for workflow states (draft, pending, approved, rejected)
**Pipeline Board:** Kanban columns with drag-drop, visual density optimization, card preview on hover

### Forms
**Input Fields:** Outlined style, floating labels, inline validation messages
**Dropdowns:** Searchable select components for long lists (departments, employees)
**Date/Time Pickers:** Modal calendar with time selection for interviews/availability
**File Uploads:** Drag-drop zone with preview thumbnails for resumes/documents
**Multi-step Forms:** Progress indicator for complex workflows (recruitment requests)

### Interactive Elements
**Primary Actions:** Solid buttons with primary color, prominent placement
**Secondary Actions:** Outlined buttons, secondary hierarchy
**Tertiary Actions:** Text/ghost buttons for less critical operations
**Action Menus:** Dropdown menus (3-dot) for row-level operations
**Modals:** Centered overlays with backdrop blur for confirmations, detail views

### Feedback
**Notifications:** Toast messages (top-right) for success/error states
**Empty States:** Illustrations + action prompts when no data exists
**Loading States:** Skeleton screens for table rows, cards; spinners for actions

## Page-Specific Patterns

### Dashboard/Home
Multi-column layout (grid-cols-3 on desktop) with metric cards, recent activity feed, pending approvals widget, quick actions panel

### Recruitment Pipeline
Full-width Kanban board with collapsible filters sidebar, candidate card compact view, bulk actions toolbar

### Interview Scheduling
Split view: calendar availability matrix (left) + candidate details (right), time slot selection with instant booking

### Employee Self-Service
Tabbed interface for different request types, request history table, document library grid

### Attendance Tracking
Calendar heatmap view + detailed log table, WFH approval queue, time-in/out entry form with geolocation capture

### Policy Management
Document list with version history, PDF viewer integration, acknowledgment tracking table

## Icons
**Library:** Heroicons (outline for navigation, solid for actions) via CDN
**Usage:** 20px for buttons/inline, 24px for feature highlights, 16px for table actions

## Images
**Presence:** Minimal - system focuses on data/forms rather than imagery
**Avatar Images:** User profile pictures (circular, 32px-40px) throughout interface
**Empty States:** Optional illustration graphics for first-run experiences
**Document Thumbnails:** PDF/file previews in template/policy libraries

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for all workflows (tab order, escape to close modals)
- Focus indicators (2px outline offset)
- Minimum contrast ratio 4.5:1 for all text
- Form error associations with aria-describedby

## Responsive Behavior
- Desktop-first approach (primary use case)
- Tablet: Collapsible sidebar, stacked cards
- Mobile: Bottom tab navigation, single-column layouts, simplified tables → lists

**Critical Note:** This is a dense enterprise application - prioritize information hierarchy and workflow efficiency over visual flair. Consistency across modules is paramount.