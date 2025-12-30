# HR Portal Demo

A comprehensive Human Resources management portal built with React and Express.js, featuring recruitment management, attendance tracking, employee self-service, and policy management.

## Features

### 📊 Dashboard
- Overview of key HR metrics
- Quick access to pending approvals
- Recent activity feed
- Summary widgets for recruitment, attendance, and requests

### 👥 Recruitment Pipeline
- Kanban-style candidate tracking through hiring stages
- Pipeline stages: Applied → Screen → Interview → Offer → Onboarding → Hired
- Drag-and-drop candidate management
- Recruitment request creation and tracking

### 📅 Interview Calendar
- Interview scheduling and management
- Availability slot management
- Interview feedback collection

### ⏱️ Attendance Tracking
- Clock in/out functionality
- Work mode tracking (office/remote)
- Attendance log history
- Geolocation capture support
- Work from home (WFH) approval workflow

### 📝 Employee Self-Service (ESS)
- Submit various request types
- Track request status
- Attachment support
- Request history

### 📋 Policy Management
- Policy document library
- Version tracking
- Policy acknowledgment tracking
- Category-based organization

### 📄 Templates
- Template document library
- Category organization
- Description and file management

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Wouter** - Lightweight routing
- **Framer Motion** - Animations
- **Recharts** - Charts and data visualization

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **Zod** - Schema validation

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ismaelloveexcel/HR-Portal-Demo.git
   cd HR-Portal-Demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file with the following variables
   DATABASE_URL=postgresql://username:password@localhost:5432/hr_portal
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── pages/          # Page components
│   └── public/             # Static assets
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data access layer
│   └── db.ts               # Database connection
├── shared/                 # Shared types and schemas
│   ├── schema.ts           # Database schema (Drizzle)
│   └── models/             # Shared data models
└── design_guidelines.md    # UI/UX design guidelines
```

## API Endpoints

### Recruitment
- `GET /api/recruitment-requests` - List recruitment requests
- `POST /api/recruitment-requests` - Create recruitment request
- `PATCH /api/recruitment-requests/:id` - Update recruitment request

### Candidates
- `GET /api/candidates` - List candidates (optional `?rrId=` filter)
- `POST /api/candidates` - Create candidate
- `PATCH /api/candidates/:id/stage` - Update candidate pipeline stage

### Interviews
- `GET /api/interviews` - List interviews
- `POST /api/interviews` - Create interview
- `PATCH /api/interviews/:id` - Update interview

### Attendance
- `GET /api/attendance` - Get attendance logs
- `POST /api/attendance` - Create attendance log
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out

### Employee Self-Service
- `GET /api/ess` - Get ESS requests
- `POST /api/ess` - Create ESS request
- `PATCH /api/ess/:id` - Update ESS request

### Policies
- `GET /api/policies` - List policies
- `POST /api/policies` - Create policy
- `PATCH /api/policies/:id` - Update policy
- `GET /api/policy-acks` - Get policy acknowledgments
- `POST /api/policy-acks` - Create policy acknowledgment

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template

## Design System

This application follows the Carbon Design System with enterprise HR customization. Key design elements include:

- **Colors**: Navy Blue (#0F3D91) primary, Green (#0FA958) accent
- **Typography**: IBM Plex Sans font family
- **Components**: Accessible components via Radix UI
- **Icons**: Lucide React icons

For detailed design guidelines, see [design_guidelines.md](./design_guidelines.md).

## License

MIT
