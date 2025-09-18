# Discombobulate - School Community Assessment Tool

## Overview
Discombobulate is a comprehensive school community assessment tool that helps schools understand relationship dynamics and provides actionable micro-rituals to strengthen community connections.

## Features
- **Multi-role Assessment**: Supports students, staff, administrators, and counselors
- **School Management**: Admin dashboard for managing school information
- **Access Code System**: 4-character codes for user identification and 7-day cooldown periods
- **Micro-rituals**: Actionable suggestions for community building
- **Real-time Scoring**: School scores that aggregate all community member assessments
- **CSV Bulk Upload**: Admin can upload multiple schools via CSV

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Extract the project files to your desired directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
1. Start the development server:
   ```bash
   npm run dev
   ```
   Or start the server directly:
   ```bash
   PORT=3001 npx tsx server/index.ts
   ```

2. Open your browser and navigate to `http://localhost:3001`

### Admin Access
- Admin access code: `6056`
- Click the settings icon next to "school community" text to access admin dashboard
- Admin features:
  - Add/edit/delete schools
  - Bulk upload schools via CSV
  - View all school data

### Key Components
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: In-memory storage (easily replaceable with PostgreSQL)
- **Routing**: Wouter for client-side routing

### Recent Updates
- ✅ Access code display after assessment completion
- ✅ 7-day cooldown enforcement
- ✅ School score aggregation from all community members
- ✅ Assessment count display for current 7-day period
- ✅ Enhanced user experience with clear messaging

### File Structure
```
discombobulate/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript schemas
├── package.json     # Dependencies and scripts
└── README.md        # Project documentation
```

### API Endpoints
- `GET /api/schools/search?q=query` - Search schools
- `POST /api/users` - Create user with auto-generated access code
- `POST /api/assessments` - Submit assessment responses
- `GET /api/schools/:id/score` - Get school score
- `GET /api/schools/:id/assessment-count` - Get assessment count for current period
- `POST /api/admin/auth` - Admin authentication
- `GET /api/admin/schools` - Get all schools (admin)
- `POST /api/admin/schools` - Create school (admin)
- `POST /api/admin/schools/bulk-upload` - Bulk upload schools (admin)

### Sample CSV Format
For bulk school upload, use this format:
```csv
name,district,city,state
Example High School,Example District,Example City,CA
Another School,Another District,Another City,NY
```

## Support
For questions or issues, please refer to the project documentation or contact the development team.
