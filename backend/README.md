# Job Portal Backend (SE3040)

This is the backend for the Sri Lanka Rural Job Opportunity Platform.

## Stack
- Node.js + Express
- MongoDB + Mongoose
- Authentication: JWT + RBAC

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in the details.
   ```bash
   cp .env.example .env
   # Or on Windows
   copy .env.example .env
   ```
   **Important**: Set `MONGO_URI` to a valid MongoDB connection string.

3. **Run Application**
   - Development: `npm run dev`
   - Production: `npm start`

4. **Run Tests**
   ```bash
   npm test
   ```

## API Structure

### Health
- `GET /health` - Check API status

### Authentication
- `POST /auth/register` - Register new user (JOB_SEEKER or EMPLOYER only)
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile (Protected)

## Project Structure
- `src/controllers`: Request handlers
- `src/services`: Business logic
- `src/models`: Database schemas
- `src/routes`: API definitions
- `src/middlewares`: Interceptors (auth, error, validate)
- `src/utils`: Helpers

## RBAC
Roles enabled:
- `ADMIN` (Seeded via config/env)
- `EMPLOYER`
- `JOB_SEEKER`

## Postman
Import the `postman_collection.json` file to test the API endpoints.
