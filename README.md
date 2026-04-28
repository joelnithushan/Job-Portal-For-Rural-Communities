# Job Portal For Rural Communities

This is a Full-Stack Web Application developed for the SE3040 - Application Frameworks module, representing a localized Sri Lankan job portal for rural communities.

## Project Overview

NextEra (Job Portal for Rural Communities) connects job seekers in rural Sri Lanka with local employers. The system covers four core components: **Authentication & Profiles** (registration with NIC-derived gender/DOB, OTP email verification, Google OAuth, password reset), **Jobs** (employer posting, district/town/category filters, age and gender requirements), **Applications** (CV upload, employer review workflow with status notifications via Email + SMS), and **Companies & Posters** (company verification by admin and AI-assisted poster generation).

### Architecture

- **Backend**: Express.js (Node.js) with a layered architecture — `routes` → `controllers` → `services` → `models`. Joi for request validation, JWT for session handling, role-based middleware (`ADMIN` / `EMPLOYER` / `JOB_SEEKER`) for protected routes, and Mongoose for MongoDB persistence.
- **Frontend**: React 19 (Vite) with React Router, Tailwind CSS v4, React Hook Form + Yup for client-side validation, Context API for global auth state, and i18next for English/Sinhala/Tamil localization.
- **Third-party services**: Cloudinary (assets/CV), Nodemailer SMTP (OTP & status emails), notify.lk (SMS), Google OAuth 2.0, Google reCAPTCHA v3, OpenRouter (AI poster generation).
- **Deployment**: Backend on Railway (Docker), frontend on Vercel.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Local MongoDB (or a MongoDB Atlas URI)
- Cloudinary Account (for Image/CV uploads)
- Google Cloud Console Account (for OAuth and reCAPTCHA v3)
- Email Provider with SMTP (e.g., Gmail App Password for OTPs)
- notify.lk account (for SMS)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd Job Portal-AF
```

### 2. Backend Setup
1. Open a new terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   **Required Backend Keys** (See `.env.example` for full list):
   - `MONGO_URI`, `JWT_SECRET`
   - **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - **Email/SMTP** (for OTP): `EMAIL_HOST`, `EMAIL_PORT` (587), `EMAIL_USER`, `EMAIL_PASS`
   - **notify.lk**: `NOTIFY_LK_USER_ID`, `NOTIFY_LK_API_KEY`, `NOTIFY_LK_SENDER_ID`
   - **Google**: `GOOGLE_CLIENT_ID`, `RECAPTCHA_SECRET`
4. Start the backend:
   ```bash
   npm run dev
   ```
   *The server runs on http://localhost:5000*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
   *The frontend runs usually on http://localhost:5173*

---

## API Endpoint Documentation

We use **Swagger UI** to auto-generate and visualize our endpoints.

Once you have started the backend, navigate to:
**http://localhost:5000/api-docs**

This interface will allow you to explore `Auth`, `Job`, and other entity endpoints, view payload schemas, and test them directly.

---

## Testing Instruction Report

This project implements layers of testing to satisfy quality standards.

### 1. Unit & Integration Tests (Jest & Supertest)
We use `Jest` combined with `mongodb-memory-server` to spin up isolated databases safely to test APIs comprehensively without mutating local data.

To run the full test suite:
```bash
cd backend
npm test
```

### 2. Performance & Load Testing (Artillery)
To evaluate the project's capacity to handle spike usages, we have defined an `artillery.yaml` load test script.

To execute the load test against your running server:
```bash
cd backend
npm run test:load
```
> [!NOTE]  
> Make sure your backend server is actively running before executing Artillery.

### Performance Testing Execution Results
Load testing was executed to ensure the system can handle concurrent users (e.g., job seekers browsing and employers posting jobs simultaneously).
- **Tool Used**: Artillery.io
- **Profile**: 20 s warm-up at 5 arrivals/s, 30 s sustained at 20 arrivals/s, 10 s spike at 50 arrivals/s.
- **Result**: 1,789 / 1,794 requests succeeded with HTTP 200 (99.7% success). Mean response time ~1.94 s, p95 ~9.05 s, p99 ~9.61 s. Average request rate ~35 req/s during the run.
- **Outcome**: The backend handled the simulated traffic without errors, confirming that the Node.js event loop and MongoDB connection pool tolerate moderate-to-high concurrent loads.

### Testing Environment Configuration Details
To ensure consistent results during testing, the following environment was used:
*   **Node.js Version**: v18.x or higher
*   **Database**: MongoDB Atlas (Cloud) / MongoDB v6.0+ (Local)
*   **Operating System**: Windows 10/11 (Development) / Linux (Deployment)
*   **Ports**: Backend (5000), Frontend (5173/Vite)
*   **Auth**: JWT-based session handling with Google OAuth 2.0 integration.

## Third-Party Integrations

The project successfully integrates several external services to enhance functionality and security:
1. **Nodemailer (SMTP)**: Powers all transactional email — registration OTPs, password resets, application-submitted confirmations, and application status-change updates.
2. **notify.lk**: Sends automated SMS to job seekers when an employer marks their application as `ACCEPTED` (and the seeker has a phone number on file).
3. **Google OAuth 2.0 (SSO)**: Integrated into the authentication flow to allow seamless and secure user sign-ups and logins without requiring custom credentials.
4. **Google reCAPTCHA v3**: Added to critical frontend forms (like registration and login) to prevent bot attacks or automated spam.
5. **Cloudinary**: Used to securely host and deliver static assets, such as employer profile pictures and related imagery.

### Notification Triggers

The platform notifies users via **Email** and **SMS** at the following points:

| Event | Email | SMS | Recipient |
| --- | :---: | :---: | --- |
| User registers (OTP verification) | Yes | No | New user |
| User requests a password reset | Yes | No | User |
| Job seeker submits an application | Yes | No | Job seeker |
| Employer changes application status (any status) | Yes | No | Job seeker |
| Application status set to `ACCEPTED` | Yes | Yes | Job seeker |

> [!NOTE]
> Email is the default channel for every user-facing event. SMS is an *additional* channel fired only on `ACCEPTED` application decisions, and only when the seeker has a phone number saved on their profile. If notify.lk credentials are missing, the SMS step is skipped silently and the email still goes through.

---

## Deployment Report

* **Frontend Deployment Platform**: Vercel
* **Frontend Setup Steps**: Pushed the frontend folder to Vercel via GitHub integration and supplied `.env.local` parameters as Environment Variables into Vercel Settings.
* **Frontend Live URL**: [https://job-portal-for-rural-communities.vercel.app](https://job-portal-for-rural-communities.vercel.app)

* **Backend Deployment Platform**: Railway (Containerized PaaS)
* **Backend Setup Steps**:
    1. Connected the GitHub repository to a new Railway project.
    2. Utilized a custom `railway.json` configuration file at the root to declare a `DOCKERFILE` builder.
    3. Railway automatically orchestrated the build context targeting `backend/Dockerfile`.
    4. Supplied all **Variables** representing the required `.env` configurations.
* **Backend Live URL**: [https://job-portal-for-rural-communities-production.up.railway.app](https://job-portal-for-rural-communities-production.up.railway.app)

### Deployment Screenshots
![Frontend Deployment](./screenshots/vercel_deployment.png)
![Backend Deployment](./screenshots/railway_deployment.png)
