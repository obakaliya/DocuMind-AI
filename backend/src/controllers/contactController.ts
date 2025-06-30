import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      res.status(400).json({ error: errorMessages });
      return;
    }

    const { name, email, message } = req.body;

    // Try to send email if configured, otherwise just log
    try {
      const { sendContactEmail } = await import('../services/emailService');
      await sendContactEmail(name, email, message);
    } catch (emailError) {
      console.error('Email service not configured:', emailError);
    }
    
    res.json({ 
      message: 'Thank you for your message! We\'ll get back to you soon.' 
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
}; 