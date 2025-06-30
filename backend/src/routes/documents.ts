import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, checkPlanLimit } from '../middleware/auth';
import { uploadDocument, getUserDocuments, analyzeDocumentById, getAnalysisResults } from '../controllers/documentController';
import { ensureUploadDirectory, generateUniqueFilename } from '../services/fileService';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirectory();
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  }
});

// Upload document
router.post('/upload', authenticateToken, checkPlanLimit, upload.single('document'), uploadDocument);

// Get user's documents
router.get('/', authenticateToken, getUserDocuments);

// Analyze document
router.post('/:id/analyze', authenticateToken, checkPlanLimit, analyzeDocumentById);

// Get analysis results
router.get('/:id/results', authenticateToken, getAnalysisResults);

export default router; 