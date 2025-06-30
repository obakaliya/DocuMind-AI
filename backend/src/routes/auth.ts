import express from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser, verifyEmail, resendVerificationEmail, requestPasswordReset, resetPassword, upgradePlan } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const resendValidation = [
  body('email').isEmail().normalizeEmail()
];

const requestResetValidation = [
  body('email').isEmail().normalizeEmail()
];

const resetPasswordValidation = [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/upgrade-plan', authenticateToken, upgradePlan);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendValidation, resendVerificationEmail);
router.post('/request-password-reset', requestResetValidation, requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, resetPassword);

export default router; 