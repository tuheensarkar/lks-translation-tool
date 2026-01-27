import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../database/db.js';
import { AuthRequest as BaseAuthRequest } from '../middleware/auth.js';

// Extend AuthRequest to include file upload properties
interface AuthRequest extends BaseAuthRequest {
    file?: Express.Multer.File;
    body: any;
    params: any;
    query: any;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TranslationJobBody {
    sourceLanguage: string;
    targetLanguage: string;
    documentType: string;
}

// Mock translation function (replace with actual AI translation service)
async function translateDocument(
    sourcePath: string,
    targetPath: string,
    sourceLanguage: string,
    targetLanguage: string,
    documentType: string
): Promise<void> {
    // This is a placeholder for actual translation logic
    // In production, integrate with Google Translate API, DeepL, or custom AI model

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // For demo purposes, just copy the file with a prefix
                const content = fs.readFileSync(sourcePath);
                fs.writeFileSync(targetPath, content);
                resolve();
            } catch (error) {
                reject(error);
            }
        }, 2000); // Simulate processing time
    });
}

// Process translation job
export const processTranslation = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const { sourceLanguage, targetLanguage, documentType } = req.body as TranslationJobBody;
        const userId = req.user.userId;

        // Create translation job record
        const jobResult = await query(
            `INSERT INTO translation_jobs 
       (user_id, source_language, target_language, document_type, 
        original_filename, original_file_path, file_size, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
            [
                userId,
                sourceLanguage,
                targetLanguage,
                documentType,
                req.file.originalname,
                req.file.path,
                req.file.size,
                'pending',
            ]
        );

        const jobId = jobResult.rows[0].id;

        // Start translation process asynchronously
        processTranslationAsync(jobId, req.file.path, req.file.originalname, sourceLanguage, targetLanguage, documentType);

        res.status(202).json({
            success: true,
            message: 'Translation job created successfully',
            data: {
                jobId,
                status: 'pending',
            },
        });
    } catch (error: any) {
        console.error('Translation processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process translation request',
        });
    }
};

// Async translation processing
async function processTranslationAsync(
    jobId: string,
    sourcePath: string,
    originalFilename: string,
    sourceLanguage: string,
    targetLanguage: string,
    documentType: string
) {
    try {
        // Update status to processing
        await query(
            'UPDATE translation_jobs SET status = $1 WHERE id = $2',
            ['processing', jobId]
        );

        // Generate translated file path
        const translatedDir = path.join(__dirname, '../../uploads/translated');
        const ext = path.extname(originalFilename);
        const translatedFilename = `translated_${jobId}${ext}`;
        const translatedPath = path.join(translatedDir, translatedFilename);

        // Perform translation
        await translateDocument(sourcePath, translatedPath, sourceLanguage, targetLanguage, documentType);

        // Update job as completed
        await query(
            `UPDATE translation_jobs 
       SET status = $1, translated_filename = $2, translated_file_path = $3, completed_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
            ['completed', translatedFilename, translatedPath, jobId]
        );

        console.log(`✅ Translation job ${jobId} completed successfully`);
    } catch (error: any) {
        console.error(`❌ Translation job ${jobId} failed:`, error);

        // Update job as failed
        await query(
            'UPDATE translation_jobs SET status = $1, error_message = $2 WHERE id = $3',
            ['failed', error.message, jobId]
        );
    }
}

// Get translation job status
export const getJobStatus = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const { jobId } = req.params;
        const userId = req.user.userId;

        const result = await query(
            `SELECT id, source_language, target_language, document_type, 
              original_filename, translated_filename, status, error_message,
              created_at, completed_at
       FROM translation_jobs
       WHERE id = $1 AND user_id = $2`,
            [jobId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Translation job not found',
            });
        }

        const job: any = result.rows[0];

        res.status(200).json({
            success: true,
            data: {
                job: {
                    id: job.id,
                    sourceLanguage: job.source_language,
                    targetLanguage: job.target_language,
                    documentType: job.document_type,
                    originalFilename: job.original_filename,
                    translatedFilename: job.translated_filename,
                    status: job.status,
                    errorMessage: job.error_message,
                    createdAt: job.created_at,
                    completedAt: job.completed_at,
                    translatedFileUrl: job.status === 'completed' ? `/api/files/${job.id}` : null,
                },
            },
        });
    } catch (error: any) {
        console.error('Get job status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch job status',
        });
    }
};

// Get user's translation history
export const getTranslationHistory = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const userId = req.user.userId;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await query(
            `SELECT id, source_language, target_language, document_type,
              original_filename, translated_filename, status, created_at, completed_at
       FROM translation_jobs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const jobs = result.rows.map((job: any) => ({
            id: job.id,
            sourceLanguage: job.source_language,
            targetLanguage: job.target_language,
            documentType: job.document_type,
            originalFilename: job.original_filename,
            translatedFilename: job.translated_filename,
            status: job.status,
            createdAt: job.created_at,
            completedAt: job.completed_at,
            translatedFileUrl: job.status === 'completed' ? `/api/files/${job.id}` : null,
        }));

        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    limit,
                    offset,
                    total: jobs.length,
                },
            },
        });
    } catch (error: any) {
        console.error('Get translation history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch translation history',
        });
    }
};

// Download translated file
export const downloadFile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const { jobId } = req.params;
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        // Fetch job details
        const result = await query(
            `SELECT user_id, translated_file_path, translated_filename, status
       FROM translation_jobs
       WHERE id = $1`,
            [jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Translation job not found',
            });
        }

        const job: any = result.rows[0];

        // Check authorization (user must own the job or be admin)
        if (job.user_id !== userId && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this file',
            });
        }

        // Check if translation is completed
        if (job.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: `Translation is not yet completed. Current status: ${job.status}`,
            });
        }

        // Check if file exists
        if (!fs.existsSync(job.translated_file_path)) {
            return res.status(404).json({
                success: false,
                message: 'Translated file not found on server',
            });
        }

        // Send file
        res.download(job.translated_file_path, job.translated_filename, (err: Error | null) => {
            if (err) {
                console.error('File download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Failed to download file',
                    });
                }
            }
        });
    } catch (error: any) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
        });
    }
};
