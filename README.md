# Auth Platform

A modern, secure authentication platform built with Next.js, TypeScript, and Node.js.

## Features

- Secure user authentication and authorization
- Modern, responsive UI with dark mode support
- Form validation and error handling
- Toast notifications for user feedback
- Type-safe development
- RESTful API architecture
- JWT-based authentication
- Rate limiting and security headers
- Database integration with Prisma
- Docker support for easy deployment

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form
- Zod for validation
- Axios for API requests
- Toast notifications for user feedback

### Backend
- Node.js
- Fastify.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT for authentication
- Rate limiting
- Security headers
- HTTP response helpers (@fastify/sensible)

## Project Structure

```
.
├── apps/
│   ├── auth-frontend/     # Next.js frontend application
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── lib/          # Utilities and API client
│   │   │   └── app/          # Next.js app router pages
│   └── auth-backend/      # Fastify.js backend application
│       ├── src/
│       │   ├── routes/       # API routes
│       │   ├── config/       # Configuration
│       │   └── utils/        # Utilities
├── packages/              # Shared packages (if any)
└── docker/               # Docker configuration files
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm
- Docker and Docker Compose (optional)
- PostgreSQL (if running locally)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/antonazaryev/sentinel-auth.git
   cd auth-platform
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # Frontend
   cp apps/auth-frontend/.env.example apps/auth-frontend/.env.local
   
   # Backend
   cp apps/auth-backend/.env.example apps/auth-backend/.env
   ```

4. Start the development servers:

   Frontend:
   ```bash
   cd apps/auth-frontend
   pnpm dev
   ```

   Backend:
   ```bash
   cd apps/auth-backend
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. The application will be available at [http://localhost:3000](http://localhost:3000)

## Development

### Frontend Development
- Uses Next.js App Router for routing
- Components built with shadcn/ui
- Form validation with Zod
- API client with Axios
- Toast notifications for feedback
- Type-safe development with TypeScript

### Backend Development
- RESTful API architecture
- JWT-based authentication
- Rate limiting for security
- Database operations with Prisma
- TypeScript for type safety
- HTTP response helpers with @fastify/sensible

## API Documentation

The API documentation is available at `/api/docs` when running the backend server.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT 