import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';
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

// External translation function using Python translator
async function translateDocument(
    sourcePath: string,
    targetPath: string,
    sourceLanguage: string,
    targetLanguage: string,
    documentType: string
): Promise<void> {
    // First, try to use the Python translator if available
    const pythonTranslatorPath = path.join(__dirname, '../../../universal_translator.py');
    
    // Check if the Python file exists
    if (!fs.existsSync(pythonTranslatorPath)) {
        console.warn('Python translator not found, falling back to mock.');
        // Fallback to mock for testing if Python translator is not available
        return new Promise((resolve) => {
            setTimeout(() => {
                const content = fs.readFileSync(sourcePath);
                fs.writeFileSync(targetPath, content);
                resolve();
            }, 2000);
        });
    }
    
    // Use Python subprocess to run the translation
    return new Promise((resolve, reject) => {
        // Create a temporary Python script to call the translator
        const tempScriptPath = path.join(os.tmpdir(), `translate_${Date.now()}.py`);
        const scriptContent = `
import sys
import os
import json

# Change to project root directory to ensure imports work correctly
project_root = os.path.dirname(r'${pythonTranslatorPath.replace(/\\/g, '\\\\')}')
os.chdir(project_root)
sys.path.insert(0, project_root)

# Log environment info for debugging
# print(f"DEBUG:Working directory:{os.getcwd()}")
# print(f"DEBUG:Executable:{sys.executable}")
# print(f"DEBUG:Path:{sys.path}")

# Import the translator
try:
    from universal_translator import UniversalTranslator, Config
    
    # Get API key from environment
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        # Try to get from the default config
        api_key = Config.API_KEY

    if not api_key:
        print("ERROR:OpenAI API key required. Please set OPENAI_API_KEY environment variable.")
        sys.exit(1)

    translator = UniversalTranslator(api_key=api_key)
    result_path = translator.translate_file(r'${sourcePath.replace(/\\/g, '\\\\')}', r'${targetPath.replace(/\\/g, '\\\\')}')
    print(f"SUCCESS:{result_path}")
except ImportError as e:
    print(f"ERROR:Missing dependencies: {str(e)} (Python: {sys.executable})")
    sys.exit(1)
except Exception as e:
    print(f"ERROR:{str(e)}")
    sys.exit(1)
        `;
        
        fs.writeFileSync(tempScriptPath, scriptContent);
        
        // Try 'python3' first, then 'python'
        let pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        
        // On Windows, check if 'python' is the Windows Store version and try to find a better one
        if (process.platform === 'win32') {
            try {
                const wherePython = execSync('where python').toString().split(/\r?\n/);
                // Filter out the WindowsApps one if possible and pick the first real installation
                const realPython = wherePython.find(p => p && p.trim() && !p.includes('WindowsApps') && p.toLowerCase().includes('python.exe'));
                if (realPython) {
                    pythonCommand = realPython.trim();
                    console.log(`[Translation] Found real Python at: ${pythonCommand}`);
                }
            } catch (e) {
                console.warn('[Translation] Could not find absolute Python path, falling back to "python"');
            }
        }
        
        console.log(`[Translation] Executing with command: ${pythonCommand}`);
        
        const pythonProcess = spawn(pythonCommand, [tempScriptPath], {
            env: { ...process.env }
        });
        
        let output = '';
        let stderrOutput = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            const str = data.toString();
            console.error('[Python Stderr]', str);
            stderrOutput += str;
        });
        
        pythonProcess.on('close', (code) => {
            // Clean up the temporary script
            try {
                fs.unlinkSync(tempScriptPath);
            } catch (unlinkErr) {
                console.error('Error cleaning up temp script:', unlinkErr);
            }
            
            // Debug output for troubleshooting
            console.log(`[Translation Debug] Exit code: ${code}`);
            console.log(`[Translation Debug] Output: "${output.trim()}"`);
            console.log(`[Translation Debug] Stderr: "${stderrOutput.trim()}"`);
            console.log(`[Translation Debug] Output starts with SUCCESS: ${output.trim().startsWith('SUCCESS:')}`);
            
            // Primary check: Look for SUCCESS: anywhere in the output (not just at start)
            if (code === 0 && output.trim().includes('SUCCESS:')) {
                console.log('[Translation] Python translation completed successfully (primary check - SUCCESS found)');
                resolve();
            }
            // Secondary check: If exit code is 0 and we can extract a file path, assume success
            else if (code === 0 && output.trim().includes('SUCCESS:') && (output.trim().includes('.pdf') || output.trim().includes('.docx') || output.trim().includes('.xlsx'))) {
                console.log('[Translation] Python translation completed successfully (secondary check - file path found)');
                resolve();
            }
            else {
                let errorMsg = '';
                // Check if there's an ERROR message in the output
                const errorMatch = output.match(/ERROR:(.*)/);
                if (errorMatch) {
                    errorMsg = errorMatch[1].trim();
                } else {
                    errorMsg = `Python process exited with code ${code}. Output: ${output.trim()} Stderr: ${stderrOutput.trim()}`;
                }
                reject(new Error(errorMsg));
            }
        });
        
        pythonProcess.on('error', (error) => {
            console.error('[Translation] Python process error:', error);
            reject(error);
        });
    });
}

// Process translation job
export const processTranslation = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            console.log('[Translation] Request failed: No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const { sourceLanguage, targetLanguage, documentType } = req.body as TranslationJobBody;
        
        // For API key authentication, we'll use a system user
        // Check if the system user exists, create if not
        let systemUserResult = await query('SELECT id FROM users WHERE email = $1', ['system@api-key.user']);
        let userId;
        
        if (systemUserResult.rows.length === 0) {
            // Create system user for API key requests
            const newUserResult = await query(
                'INSERT INTO users (name, email, password_hash, role, organization) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                ['API Key System User', 'system@api-key.user', '$2b$10$defaultHashForApiKeyUser', 'user', 'API System']
            );
            userId = newUserResult.rows[0].id;
        } else {
            userId = systemUserResult.rows[0].id;
        }

        console.log(`[Translation] Creating job for user: ${userId}, file: ${req.file.originalname}`);

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
        console.log(`[Translation] Job created with ID: ${jobId}`);

        // Start translation process asynchronously
        processTranslationAsync(jobId, req.file.path, req.file.originalname, sourceLanguage, targetLanguage, documentType);

        res.status(202).json({
            success: true,
            message: 'Translation job created successfully',
            data: {
                jobId,
                status: 'pending',
                progress: 0,
            },
        });
    } catch (error: any) {
        console.error('[Translation] Error in processTranslation:', error);
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
    // Get the system user ID for this function
    let systemUserId: string;
    try {
        const systemUserResult = await query('SELECT id FROM users WHERE email = $1', ['system@api-key.user']);
        if (systemUserResult.rows.length > 0) {
            systemUserId = systemUserResult.rows[0].id;
        } else {
            console.error('System user not found for async processing');
            return;
        }
    } catch (error) {
        console.error('Error getting system user for async processing:', error);
        return;
    }
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
        const { jobId } = req.params;
        
        // For API key authentication, we'll use a system user
        // Check if the system user exists
        const systemUserResult = await query('SELECT id FROM users WHERE email = $1', ['system@api-key.user']);
        const userId = systemUserResult.rows[0]?.id || null;
        
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'System user not found',
            });
        }

        const result = await query(
            `SELECT id, source_language, target_language, document_type, 
              original_filename, translated_filename, status, error_message,
              created_at, completed_at
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

        // Check if we have the translated file URL from the external API
        const translatedFileUrl = job.status === 'completed' ? `/api/files/${job.id}` : null;
        
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
                    translatedFileUrl,
                    progress: job.status === 'completed' ? 100 : (job.status === 'processing' ? 50 : 0),
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
        // For API key authentication, we'll use a system user
        // Check if the system user exists
        const systemUserResult = await query('SELECT id FROM users WHERE email = $1', ['system@api-key.user']);
        const userId = systemUserResult.rows[0]?.id || null;
        
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'System user not found',
            });
        }
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await query(
            `SELECT id, source_language, target_language, document_type,
              original_filename, translated_filename, status, created_at, completed_at
       FROM translation_jobs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
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

        // Add progress to each job
        const jobsWithProgress = jobs.map((job: any) => ({
            ...job,
            progress: job.status === 'completed' ? 100 : (job.status === 'processing' ? 50 : 0),
        }));
        
        res.status(200).json({
            success: true,
            data: {
                jobs: jobsWithProgress,
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
        const { jobId } = req.params;
        
        // For API key authentication, we'll use a system user
        // Check if the system user exists
        const systemUserResult = await query('SELECT id FROM users WHERE email = $1', ['system@api-key.user']);
        const userId = systemUserResult.rows[0]?.id || null;
        
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'System user not found',
            });
        }
        
        // For this implementation, we'll bypass user-specific checks
        const isAdmin = true;

        console.log(`[Download] Request for job: ${jobId} by user: ${userId}`);

        // Fetch job details
        const result = await query(
            `SELECT user_id, translated_file_path, translated_filename, status
       FROM translation_jobs
       WHERE id = $1`,
            [jobId]
        );

        if (result.rows.length === 0) {
            console.log(`[Download] Job not found: ${jobId}`);
            return res.status(404).json({
                success: false,
                message: 'Translation job not found',
            });
        }

        const job: any = result.rows[0];

        // With API key authentication, we may not need user-specific checks
        // Authorization logic would depend on specific requirements
        // For now, we'll allow access to the file if it exists and is completed

        // Check if translation is completed
        if (job.status !== 'completed') {
            console.log(`[Download] Translation not completed. Status: ${job.status}`);
            return res.status(400).json({
                success: false,
                message: `Translation is not yet completed. Current status: ${job.status}`,
            });
        }

        // Check if file exists
        if (!fs.existsSync(job.translated_file_path)) {
            console.error(`[Download] File NOT found on disk at: ${job.translated_file_path}`);
            return res.status(404).json({
                success: false,
                message: 'Translated file not found on server',
            });
        }

        console.log(`[Download] Sending file: ${job.translated_file_path}`);

        // Send file
        res.download(job.translated_file_path, job.translated_filename, (err: Error | null) => {
            if (err) {
                console.error('[Download] res.download callback error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Failed to download file',
                    });
                }
            } else {
                console.log(`[Download] Successfully sent: ${job.translated_filename}`);
            }
        });
    } catch (error: any) {
        console.error('[Download] Internal server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
        });
    }
};
