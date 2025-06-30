import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { analyzeDocument, calculateConfidenceScore } from '../services/aiService';
import { extractTextFromFile, validateFile } from '../services/fileService';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Validate file
    try {
      validateFile(req.file);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
      return;
    }

    // Save document to database
    const result = await pool.query(
      'INSERT INTO documents (user_id, filename, file_path, file_size) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, req.file.originalname, req.file.path, req.file.size]
    );

    const document = result.rows[0];

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        filename: document.filename,
        status: document.status,
        file_size: document.file_size,
        created_at: document.created_at
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const result = await pool.query(
      `SELECT d.*, a.confidence_score 
       FROM documents d 
       LEFT JOIN analyses a ON d.id = a.document_id 
       WHERE d.user_id = $1 
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    res.json({
      documents: result.rows.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        status: doc.status,
        file_size: doc.file_size,
        confidence_score: doc.confidence_score,
        created_at: doc.created_at
      }))
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const analyzeDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const documentId = parseInt(req.params.id);

    // Get document
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, req.user.id]
    );

    if (docResult.rows.length === 0) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const document = docResult.rows[0];

    if (document.status === 'processing') {
      res.status(400).json({ error: 'Document is already being processed' });
      return;
    }

    // Update status to processing
    await pool.query(
      'UPDATE documents SET status = $1 WHERE id = $2',
      ['processing', documentId]
    );

    try {
      // Extract text from file
      const text = await extractTextFromFile(document.file_path, 'application/pdf');

      // Analyze with AI
      const analysis = await analyzeDocument(text);
      const confidenceScore = calculateConfidenceScore(analysis);

      // Save analysis to database
      await pool.query(
        `INSERT INTO analyses (document_id, summary, key_terms, risks, deadlines, confidence_score) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          documentId,
          analysis.summary,
          JSON.stringify(analysis),
          JSON.stringify(analysis.risks),
          JSON.stringify(analysis.dates),
          confidenceScore
        ]
      );

      // Update document status and increment user's document count
      await pool.query(
        'UPDATE documents SET status = $1 WHERE id = $2',
        ['completed', documentId]
      );

      await pool.query(
        'UPDATE users SET documents_processed_this_month = documents_processed_this_month + 1 WHERE id = $1',
        [req.user.id]
      );

      res.json({
        message: 'Document analyzed successfully',
        analysis: {
          summary: analysis.summary,
          parties: analysis.parties,
          dates: analysis.dates,
          financial_terms: analysis.financial_terms,
          obligations: analysis.obligations,
          risks: analysis.risks,
          termination_conditions: analysis.termination_conditions,
          confidence_score: confidenceScore
        }
      });
    } catch (analysisError) {
      // Update status to failed
      await pool.query(
        'UPDATE documents SET status = $1 WHERE id = $2',
        ['failed', documentId]
      );

      throw analysisError;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
};

export const getAnalysisResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const documentId = parseInt(req.params.id);

    // Get document and analysis
    const result = await pool.query(
      `SELECT d.*, a.summary, a.key_terms, a.risks, a.deadlines, a.confidence_score, a.created_at as analysis_created_at
       FROM documents d 
       LEFT JOIN analyses a ON d.id = a.document_id 
       WHERE d.id = $1 AND d.user_id = $2`,
      [documentId, req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const row = result.rows[0];

    if (row.status !== 'completed') {
      res.status(400).json({ error: 'Document analysis not completed' });
      return;
    }

    function safeParse(val: any, fallback: any) {
      if (!val) return fallback;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      }
      return val;
    }

    const keyTerms = safeParse(row.key_terms, {});
    const risks = safeParse(row.risks, []);
    const deadlines = safeParse(row.deadlines, []);

    res.json({
      document: {
        id: row.id,
        filename: row.filename,
        status: row.status,
        created_at: row.created_at
      },
      analysis: {
        summary: row.summary,
        parties: keyTerms.parties || [],
        dates: deadlines,
        financial_terms: keyTerms.financial_terms || [],
        obligations: keyTerms.obligations || [],
        risks: risks,
        termination_conditions: keyTerms.termination_conditions || [],
        confidence_score: row.confidence_score,
        created_at: row.analysis_created_at
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 