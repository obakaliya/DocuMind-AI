import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

export const extractTextFromWord = async (filePath: string): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Word document parsing error:', error);
    throw new Error('Failed to parse Word document');
  }
};

export const extractTextFromFile = async (filePath: string, mimeType: string): Promise<string> => {
  const extension = path.extname(filePath).toLowerCase();
  
  if (extension === '.pdf' || mimeType === 'application/pdf') {
    return extractTextFromPDF(filePath);
  } else if (extension === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromWord(filePath);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or Word documents only.');
  }
};

export const validateFile = (file: Express.Multer.File): void => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const allowedExtensions = ['.pdf', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Please upload PDF or Word documents only.');
  }
  
  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error('Invalid file extension. Please upload PDF or Word documents only.');
  }
  
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }
};

export const ensureUploadDirectory = (): void => {
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const nameWithoutExtension = path.basename(originalName, extension);
  
  return `${nameWithoutExtension}_${timestamp}_${randomString}${extension}`;
}; 