# DocuMind - AI-Powered Document Analysis Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![AI](https://img.shields.io/badge/AI-Gemini%20API-brightgreen.svg)](https://ai.google.dev/)

DocuMind is an intelligent document analysis platform that leverages AI to extract key information from legal documents, contracts, and other business documents. Built with modern web technologies, it provides secure, scalable, and user-friendly document processing capabilities.

## Features

- **AI-Powered Analysis**: Advanced document analysis using Google's Gemini AI model
- **Multiple File Formats**: Support for PDF and Word documents (.docx)
- **Secure Authentication**: JWT-based user registration and login system
- **Subscription Management**: Pro plan with unlimited document analysis
- **Stripe Integration**: Secure payment processing with Stripe
- **Email Verification**: Account verification system with Nodemailer
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Security**: Rate limiting, CORS protection, and Helmet security headers
- **Document Analytics**: Track processing history and analysis results

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DocuMind
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/documind

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Database Setup

1. Create a PostgreSQL database named `documind`
2. The application will automatically create the required tables on first run

### 6. Running the Application

#### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
