import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { User } from '../types';

export interface AuthRequest extends Request {
  user?: User;
}

export const generateToken = (user: User, rememberMe: boolean = false): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  // Set expiration time based on rememberMe
  const expiresIn = rememberMe 
    ? process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d'  // 30 days for remember me
    : process.env.JWT_EXPIRES_IN || '7d';              // 7 days for normal login
  
  return (jwt.sign as any)(
    { id: user.id, email: user.email },
    secret,
    { expiresIn }
  );
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }
    
    let decoded: { id: number; email: string };
    
    try {
      decoded = (jwt.verify as any)(token, secret) as { id: number; email: string };
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      res.status(401).json({ error: 'Token expired or invalid' });
      return;
    }
    
    // Add retry logic for database queries
    let result;
    let retries = 3;
    
    while (retries > 0) {
      try {
        result = await pool.query(
          'SELECT id, email, name, plan, documents_processed_this_month, created_at FROM users WHERE id = $1',
          [decoded.id]
        );
        break;
      } catch (dbError) {
        retries--;
        if (retries === 0) {
          console.error('Database query failed after retries:', dbError);
          res.status(500).json({ error: 'Database connection error' });
          return;
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (!result || result.rows.length === 0) {
      console.error('User not found for token:', decoded.id);
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const checkPlanLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Get fresh user data to ensure document count is current
  const result = await pool.query(
    'SELECT plan, documents_processed_this_month, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (result.rows.length === 0) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const user = result.rows[0];
  
  // Simple monthly reset: if it's been more than 30 days since user creation, reset count
  // This is a simplified approach - in production you'd want a proper monthly tracking system
  const now = new Date();
  const userCreatedAt = new Date(user.created_at);
  const daysSinceCreation = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
  
  // Reset if it's been more than 30 days (simplified monthly reset)
  if (daysSinceCreation > 30) {
    await pool.query(
      'UPDATE users SET documents_processed_this_month = 0 WHERE id = $1',
      [req.user.id]
    );
    user.documents_processed_this_month = 0;
  }
  
  if (user.plan === 'free' && user.documents_processed_this_month >= 5) {
    res.status(403).json({ 
      error: 'Monthly limit reached. Upgrade to Pro for unlimited document analysis.' 
    });
    return;
  }

  next();
}; 