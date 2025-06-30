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

## Tech Stack

### Backend
- **Node.js** (v18+) with **TypeScript**
- **Express.js** framework with middleware support
- **PostgreSQL** database with connection pooling
- **Stripe** for payment processing and subscription management
- **Google Gemini API** for AI-powered document analysis
- **JWT** for secure authentication
- **Nodemailer** for email services
- **Multer** for file upload handling
- **PDF-parse** and **Mammoth** for document parsing
- **Helmet** and **CORS** for security
- **Express Rate Limit** for API protection

### Frontend
- **React** (v19.1.0) with **TypeScript**
- **Tailwind CSS** for modern, responsive styling
- **Axios** for HTTP API calls
- **React Router DOM** for client-side navigation
- **React Dropzone** for drag-and-drop file uploads
- **Headless UI** and **Heroicons** for UI components
- **Lucide React** for additional icons

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

#### Production Build

```bash
# Build both frontend and backend
cd backend
npm run build

# Start production server
npm start
```

## Project Structure

```
DocuMind/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Database configuration
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Authentication logic
│   │   │   ├── documentController.ts # Document processing
│   │   │   ├── paymentController.ts # Stripe integration
│   │   │   └── contactController.ts # Contact form handling
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts              # Authentication routes
│   │   │   ├── documents.ts         # Document API routes
│   │   │   ├── payments.ts          # Payment routes
│   │   │   └── contact.ts           # Contact routes
│   │   ├── services/
│   │   │   ├── aiService.ts         # Gemini AI integration
│   │   │   ├── emailService.ts      # Email functionality
│   │   │   ├── fileService.ts       # File handling
│   │   │   └── stripeService.ts     # Stripe payment processing
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript type definitions
│   │   └── server.ts                # Main server file
│   ├── uploads/                     # File upload directory
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── contexts/                # React contexts
│   │   ├── services/                # API services
│   │   ├── types/                   # TypeScript types
│   │   └── App.tsx                  # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Documents
- `GET /api/documents` - Get user's documents
- `POST /api/documents/upload` - Upload new document
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/analysis` - Get document analysis

### Payments
- `POST /api/payments/create-subscription` - Create Stripe subscription
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/subscription` - Get subscription status

### Contact
- `POST /api/contact` - Send contact form

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: API request rate limiting
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet Security**: Security headers middleware
- **Input Validation**: Express-validator for request validation
- **File Upload Security**: Secure file handling with size limits

## Database Schema

The application uses three main tables:

- **users**: User accounts, subscriptions, and verification data
- **documents**: Uploaded documents and their metadata
- **analyses**: AI analysis results for each document

## Deployment

### Environment Variables

Make sure to set all required environment variables in your production environment:

- Database connection string
- JWT secret key
- Stripe API keys
- Gemini AI API key
- Email service credentials
- Frontend URL for CORS

### Build Process

The backend build process automatically:
1. Installs dependencies
2. Builds the frontend React app
3. Copies the built frontend to the backend's public directory
4. Compiles TypeScript to JavaScript

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## Version History

- **v1.0.0**: Initial release with core document analysis features
- AI-powered document processing
- User authentication and subscription management
- Stripe payment integration
- Responsive web interface
