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

## Key Features (To Be Implemented)
- [ ] User authentication (login/register)
- [ ] Vehicle search and filtering
- [ ] Booking flow
- [ ] User dashboard
- [ ] Agency dashboard
- [ ] Admin panel
- [ ] Payment integration
- [ ] Review and rating system
- [ ] Support ticket system

## Code Style
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety (optional migration)
- Keep components small and focused
- Use TailwindCSS utility classes
