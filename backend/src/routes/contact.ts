import express from 'express';
import { body } from 'express-validator';
import { submitContact } from '../controllers/contactController';

const router = express.Router();

// Validation rules for contact form
const contactValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters long')
];

// Contact form submission
router.post('/submit', contactValidation, submitContact);

export default router; 