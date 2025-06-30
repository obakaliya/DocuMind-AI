import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { generateToken, hashPassword, comparePassword } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      res.status(400).json({ error: errorMessages });
      return;
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, email_verification_token, email_verification_expires) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, plan, email_verified',
      [email, hashedPassword, name, verificationToken, verificationExpires]
    );

    const user = result.rows[0];

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      res.status(400).json({ error: errorMessages });
      return;
    }

    const { email, password, rememberMe } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, name, plan, documents_processed_this_month, email_verified, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_end_date, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if email is verified
    if (!user.email_verified) {
      res.status(401).json({ 
        error: 'Please verify your email address before logging in. Check your inbox for a verification link.' 
      });
      return;
    }

    const token = generateToken(user, rememberMe);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        documents_processed_this_month: user.documents_processed_this_month,
        email_verified: user.email_verified,
        stripe_customer_id: user.stripe_customer_id,
        stripe_subscription_id: user.stripe_subscription_id,
        subscription_status: user.subscription_status,
        subscription_end_date: user.subscription_end_date,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const result = await pool.query(
      'SELECT id, email, name, email_verification_expires FROM users WHERE email_verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'Invalid verification token' });
      return;
    }

    const user = result.rows[0];

    // Check if token is expired
    if (new Date() > new Date(user.email_verification_expires)) {
      res.status(400).json({ error: 'Verification token has expired' });
      return;
    }

    // Update user to verified
    await pool.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $1',
      [user.id]
    );

    res.json({
      message: 'Email verified successfully. You can now log in to your account.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      res.status(400).json({ error: errorMessages });
      return;
    }

    const { email } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, email, name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    if (user.email_verified) {
      res.status(400).json({ error: 'Email is already verified' });
      return;
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await pool.query(
      'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE id = $3',
      [verificationToken, verificationExpires, user.id]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken, user.name);
    res.json({
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Get fresh user data including Stripe fields
    const result = await pool.query(
      'SELECT id, email, name, plan, documents_processed_this_month, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_end_date, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        documents_processed_this_month: user.documents_processed_this_month,
        stripe_customer_id: user.stripe_customer_id,
        stripe_subscription_id: user.stripe_subscription_id,
        subscription_status: user.subscription_status,
        subscription_end_date: user.subscription_end_date,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upgradePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if user is already on Pro plan
    if (req.user.plan === 'pro') {
      res.status(400).json({ error: 'User is already on Pro plan' });
      return;
    }

    // Update user plan to Pro
    const result = await pool.query(
      'UPDATE users SET plan = $1 WHERE id = $2 RETURNING id, email, name, plan, documents_processed_this_month, created_at',
      ['pro', req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updatedUser = result.rows[0];
    res.json({
      message: 'Plan upgraded successfully to Pro',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        plan: updatedUser.plan,
        documents_processed_this_month: updatedUser.documents_processed_this_month,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Plan upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      res.status(400).json({ error: errorMessages });
      return;
    }

    const { email } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
      return;
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await pool.query(
      'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken, user.name);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.status(500).json({ error: 'Failed to send password reset email' });
      return;
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      res.status(400).json({ error: errorMessages });
      return;
    }

    const { token, password } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Find user with this reset token
    const result = await pool.query(
      'SELECT id, email, name, email_verification_expires FROM users WHERE email_verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    const user = result.rows[0];

    // Check if token is expired
    if (new Date() > new Date(user.email_verification_expires)) {
      res.status(400).json({ error: 'Reset token has expired' });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = $1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $2',
      [passwordHash, user.id]
    );
    res.json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 