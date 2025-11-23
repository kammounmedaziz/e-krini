# Frontend README

## Car Rental Platform - Frontend

Built with React, Vite, and TailwindCSS.

## Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State Management:** Context API / Redux Toolkit (TBD)
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest + React Testing Library
- **E2E Testing:** Playwright

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Runs on `http://localhost:5173`

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure
```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (routes)
├── hooks/            # Custom React hooks
├── context/          # React Context providers
├── api/              # API client and endpoints
├── utils/            # Utility functions
├── assets/           # Images, fonts, etc.
└── styles/           # Global styles
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## Environment Variables
Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_KEY=your-google-maps-api-key
```

## Key Features

### ✅ Completed Features
- [x] User authentication (login/register)
  - Email/password authentication
  - Face authentication integration
  - JWT token-based auth
  - Role-based access control (client, admin, agency, insurance)
- [x] User dashboard (Client)
  - Profile management
  - Booking history
  - Settings
- [x] Agency dashboard
  - Company profile management
  - Vehicle fleet management interface
  - Booking management
  - Statistics and analytics
- [x] Insurance dashboard
  - Company profile management
  - Policy management interface
  - Claims management
  - Coverage types management
  - Statistics and analytics
- [x] Admin panel
  - User management
  - System overview
- [x] Protected routes with role-based access
- [x] Responsive design with TailwindCSS
- [x] Social login (Google, Facebook) integration
- [x] Password reset functionality

### 🚧 In Progress / To Be Implemented
- [ ] Vehicle search and filtering
- [ ] Complete booking flow
- [ ] Payment integration (Stripe/PayPal)
- [ ] Review and rating system
- [ ] Support ticket system
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Dark mode (theme context implemented, needs completion)
- [ ] Vehicle details pages
- [ ] Agency vehicle CRUD operations
- [ ] Insurance policy creation workflow
- [ ] Claims submission and tracking
- [ ] Document upload and verification
- [ ] Advanced search filters
- [ ] Map integration for agency locations

## Code Style
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety (optional migration)
- Keep components small and focused
- Use TailwindCSS utility classes
