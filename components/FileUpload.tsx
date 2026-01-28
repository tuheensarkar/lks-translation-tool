import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2 } from './ui/Icons';
import { DocumentTypeOption } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  selectedDocType: DocumentTypeOption | null;
  hasError?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  selectedDocType,
  hasError 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate legal document type
      if (isValidLegalDocument(file)) {
        setValidationError(null);
        onFileSelect(file);
      } else {
        setValidationError('Please upload only legal documents (contracts, agreements, legal briefs, court documents, etc.)');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate legal document type
      if (isValidLegalDocument(file)) {
        setValidationError(null);
        onFileSelect(file);
      } else {
        setValidationError('Please upload only legal documents (contracts, agreements, legal briefs, court documents, etc.)');
      }
    }
  }, [onFileSelect]);

  // Function to validate legal documents
  const isValidLegalDocument = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Check file extension
    const legalExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.html', '.xml', '.json'];
    
    // Check if file has legal extension
    const hasValidExtension = legalExtensions.some(ext => fileName.endsWith(ext));
    
    // Check if file name suggests legal content
    const legalKeywords = [
      'contract', 'agreement', 'legal', 'brief', 'court', 'motion', 'petition', 'complaint',
      'order', 'judgment', 'decision', 'ruling', 'settlement', 'discovery', 'subpoena',
      'deposition', 'affidavit', 'declaration', 'notice', 'demand', 'disclosure',
      'certificate', 'license', 'permit', 'bond', 'lien', 'mortgage', 'deed', 'will',
      'trust', 'estate', 'probate', 'litigation', 'arbitration', 'mediation', 'compliance',
      'regulatory', 'bylaws', 'charter', 'resolution', 'minutes', 'partnership', 'operating'
    ];
    
    const containsLegalKeyword = legalKeywords.some(keyword => fileName.includes(keyword));
    
    // For now, we'll accept any file with a valid extension, but prioritize files with legal keywords
    return hasValidExtension && (containsLegalKeyword || selectedDocType?.id !== 'text'); // Be stricter for text files
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!selectedDocType) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center bg-gray-50/50 opacity-60 cursor-not-allowed transition-all duration-300">
        <div className="flex flex-col items-center">
           <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <AlertCircle size={24} />
           </div>
           <p className="text-sm text-gray-500 font-medium font-serif tracking-wide">Select a Document Type above to enable upload</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 ease-out cursor-pointer group flex flex-col items-center justify-center text-center overflow-hidden
            ${isDragging 
              ? 'border-lks-gold bg-lks-gold/10 scale-[1.01] shadow-xl' 
              : 'border-gray-300 bg-white hover:border-lks-navy hover:bg-blue-50/30 hover:shadow-md'
            }
            ${hasError ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          {validationError && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-2 text-center z-30">
              {validationError}
            </div>
          )}
          
          {/* Animated Icon Background */}
          <div className={`absolute pointer-events-none transition-transform duration-500 opacity-5 z-0
            ${isDragging ? 'scale-150 text-lks-gold' : 'scale-100 text-lks-navy'}`}>
             <UploadCloud size={160} />
          </div>

          <div className="relative z-20 flex flex-col items-center">
            <div className={`
              p-5 rounded-2xl mb-5 transition-all duration-300 shadow-sm z-10
              ${isDragging 
                ? 'bg-lks-gold text-white scale-110 rotate-3' 
                : 'bg-lks-navy text-white group-hover:bg-lks-navyLight group-hover:-translate-y-1'
              }
            `}>
              <UploadCloud size={32} strokeWidth={1.5} />
            </div>
            
            <h3 className={`text-xl font-serif font-bold mb-2 transition-colors ${isDragging ? 'text-lks-navy' : 'text-gray-900'} z-10`}>
              Upload your document
            </h3>
            
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed z-10">
              Drag and drop your file here, or click to browse your secure local directory.
            </p>
            
            <div className="inline-flex items-center px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200 text-xs font-medium text-gray-500 shadow-sm z-10">
               <span className="mr-2 uppercase tracking-wider text-lks-navy font-bold">Accepted:</span> 
               {selectedDocType.extensions.join(', ')}
            </div>
          </div>
          
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            onChange={handleFileInput}
            accept={selectedDocType.extensions.join(',')}
            title="Select legal documents only (contracts, agreements, legal briefs, etc.)"
          />
        </div>
      ) : (
        /* Success / Selected State */
        <div className={`bg-white border ${validationError ? 'border-red-300' : 'border-lks-gold/40'} rounded-xl p-8 shadow-md relative overflow-hidden animate-fade-in group hover:shadow-lg transition-shadow duration-300`}>
          
          {/* Show error message if validation failed */}
          {validationError && (
            <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center z-20">
              <div className="text-white text-center p-4">
                <div className="font-bold mb-2">Invalid Document Type</div>
                <div className="text-sm">{validationError}</div>
              </div>
            </div>
          )}
          
          {/* Decorative Background Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-lks-gold/10 to-transparent -mr-8 -mt-8 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center space-x-6 relative z-10">
            {/* Icon Container */}
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 bg-gradient-to-br from-lks-navy to-lks-navyLight text-white rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                 <FileText size={36} strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 border-4 border-white shadow-sm flex items-center justify-center animate-bounce-subtle">
                 <CheckCircle2 size={16} strokeWidth={3} />
              </div>
            </div>

            {/* File Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-serif font-bold text-gray-900 truncate mb-1">
                {selectedFile.name}
              </h3>
              <div className="flex items-center flex-wrap gap-3">
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {formatFileSize(selectedFile.size)}
                </span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300"></span>
                <span className="text-sm text-lks-gold font-bold uppercase tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-lks-gold mr-2 animate-pulse"></span>
                  Ready for Translation
                </span>
              </div>
                        
              {/* Warning message for Excel files */}
              {selectedFile.name.toLowerCase().endsWith('.xls') || selectedFile.name.toLowerCase().endsWith('.xlsx') ? (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex items-start">
                  <AlertCircle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>For best results, use PDF/DOC or other text-based formats instead of Excel files.</span>
                </div>
              ) : null}
            </div>

            {/* Remove Action */}
            <button
              onClick={onFileRemove}
              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100"
              title="Remove file"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;