export type DocumentType = 
  | 'pdf' 
  | 'word' 
  | 'excel' 
  | 'powerpoint' 
  | 'text' 
  | 'opendoc' 
  | 'web' 
  | 'image';

export interface LanguageOption {
  code: string;
  name: string;
}

export interface DocumentTypeOption {
  id: DocumentType;
  label: string;
  extensions: string[];
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface TranslationState {
  docType: DocumentType | '';
  sourceLang: string;
  targetLang: string;
  file: File | null;
  status: ProcessingStatus;
  progress: number;
  errorMessage?: string;
  translatedFileUrl?: string;
  jobId?: string;
}