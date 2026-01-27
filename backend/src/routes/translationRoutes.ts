import express from 'express';
import {
    processTranslation,
    getJobStatus,
    getTranslationHistory,
    downloadFile,
} from '../controllers/translationController.js';
import { authenticate } from '../middleware/auth.js';
import { validateTranslationJob } from '../middleware/validation.js';
import upload, { handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   POST /api/process-translation
 * @desc    Upload document and create translation job
 * @access  Private
 */
router.post(
    '/process-translation',
    authenticate,
    upload.single('file'),
    handleUploadError,
    validateTranslationJob,
    processTranslation
);

/**
 * @route   GET /api/jobs/:jobId
 * @desc    Get translation job status
 * @access  Private
 */
router.get('/jobs/:jobId', authenticate, getJobStatus);

/**
 * @route   GET /api/jobs
 * @desc    Get user's translation history
 * @access  Private
 */
router.get('/jobs', authenticate, getTranslationHistory);

/**
 * @route   GET /api/files/:jobId
 * @desc    Download translated file
 * @access  Private
 */
router.get('/files/:jobId', authenticate, downloadFile);

export default router;
