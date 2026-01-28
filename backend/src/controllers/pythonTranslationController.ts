import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { query } from '../database/db.js';

interface PythonTranslationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  documentType: string;
  filePath: string;
}

interface PythonTranslationResponse {
  success: boolean;
  translatedFilePath?: string;
  error?: string;
}

export const processPythonTranslation = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { sourceLanguage, targetLanguage, documentType } = req.body;
    const filePath = req.file.path;

    // Execute Python translation script
    const pythonScriptPath = path.join(process.cwd(), 'python-translator.py');
    const outputPath = path.join(process.cwd(), 'uploads', 'translated', `translated_${Date.now()}_${req.file.originalname}`);

    // Create the Python script to run the translation
    const pythonCode = `
import sys
sys.path.append('.')
from universal_translator import UniversalTranslator
import os

# Set API key from environment or use default
api_key = os.environ.get('OPENAI_API_KEY', '${process.env.OPENAI_API_KEY || 'your-openai-api-key-here'}')

try:
    translator = UniversalTranslator(api_key=api_key)
    result_path = translator.translate_file('${filePath}', '${outputPath}')
    print(f"SUCCESS:{result_path}")
except Exception as e:
    print(f"ERROR:{str(e)}")
`;

    // Write the Python code to a temporary file
    const tempPythonPath = path.join(process.cwd(), 'temp_translate.py');
    await fs.writeFile(tempPythonPath, pythonCode);

    // Execute the Python script
    exec(`python "${tempPythonPath}"`, async (error, stdout, stderr) => {
      // Clean up the temporary Python file
      await fs.unlink(tempPythonPath);

      if (error) {
        console.error('Python script error:', error);
        return res.status(500).json({
          success: false,
          message: `Python script execution failed: ${error.message}`,
        });
      }

      if (stderr) {
        console.error('Python script stderr:', stderr);
      }

      const output = stdout.trim();
      if (output.startsWith('SUCCESS:')) {
        const translatedFilePath = output.substring(8); // Remove 'SUCCESS:' prefix
        
        // Update the job in the database to mark as completed
        const jobId = req.params.jobId; // Assuming jobId is passed
        if (jobId) {
          await query(
            'UPDATE translation_jobs SET status = $1, translated_file_path = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
            ['completed', translatedFilePath, jobId]
          );
        }

        res.status(200).json({
          success: true,
          translatedFilePath,
          message: 'Translation completed successfully',
        });
      } else if (output.startsWith('ERROR:')) {
        const errorMessage = output.substring(6); // Remove 'ERROR:' prefix
        res.status(500).json({
          success: false,
          message: `Translation failed: ${errorMessage}`,
        });
      } else {
        res.status(500).json({
          success: false,
          message: `Unexpected output from Python script: ${output}`,
        });
      }
    });
  } catch (error: any) {
    console.error('Python translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process translation request',
    });
  }
};