import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import FileUpload from './FileUpload';
import StatusFeedback from './StatusFeedback';
import CustomDropdown from './CustomDropdown';
import TranslationHistory from './TranslationHistory';
import TranslationService from '../services/TranslationService'; 
import { DOCUMENT_TYPES, LANGUAGES } from '../constants';
import { TranslationState, DocumentType } from '../types';
import { ArrowRight, CheckCircle2, ShieldCheck, Languages as LangIcon } from './ui/Icons';

const TranslatorApp: React.FC = () => {
  const [state, setState] = useState<TranslationState>({
    docType: '',
    sourceLang: '',
    targetLang: '',
    file: null,
    status: 'idle',
    progress: 0,
    errorMessage: undefined
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleDocTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as DocumentType;
    setState(prev => ({ 
      ...prev, 
      docType: newType, 
      file: null, 
      status: 'idle'
    }));
  };

  const handleFileSelect = (file: File) => {
    setState(prev => ({ ...prev, file, status: 'idle' }));
  };

  const handleFileRemove = () => {
    setState(prev => ({ ...prev, file: null, status: 'idle' }));
  };

  const handleReset = () => {
    setState({
      docType: '',
      sourceLang: '',
      targetLang: '',
      file: null,
      status: 'idle',
      progress: 0
    });
  };

  const startTranslation = () => {
    if (!state.file || !state.docType) return;

    setState(prev => ({ ...prev, status: 'uploading', progress: 0 }));

    // Simulate upload
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(uploadInterval);
        setState(prev => ({ ...prev, status: 'processing', progress: 0 }));
        startProcessing();
      } else {
        setState(prev => ({ ...prev, progress }));
      }
    }, 100);
  };

  const startProcessing = () => {
    // Simulate server-side translation
    let progress = 0;
    const processInterval = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        clearInterval(processInterval);
        setState(prev => ({ ...prev, status: 'completed', progress: 100 }));
      } else {
        setState(prev => ({ ...prev, progress }));
      }
    }, 150);
  };

  const selectedDocTypeOption = DOCUMENT_TYPES.find(d => d.id === state.docType) || null;
  const isReadyToTranslate = state.docType && state.sourceLang && state.targetLang && state.file;
  const isProcessingOrComplete = state.status !== 'idle' && state.status !== 'error';

  // Helper to determine step status for the sidebar
  const getStepStatus = (step: number) => {
    if (state.status === 'completed') return 'completed';
    if (state.status === 'processing' || state.status === 'uploading') {
      if (step === 4) return 'current';
      return 'completed';
    }
    
    if (step === 1) return state.docType ? 'completed' : 'current';
    if (step === 2) return state.docType ? (state.sourceLang && state.targetLang ? 'completed' : 'current') : 'pending';
    if (step === 3) return (state.sourceLang && state.targetLang) ? (state.file ? 'completed' : 'current') : 'pending';
    if (step === 4) return state.file ? 'ready' : 'pending';
    return 'pending';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-lks-text bg-gray-50">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    
        {/* Hero Section */}
        <div className="text-center mb-15">
           <div className="flex justify-center mb-6">
             <div className="bg-white p-3 rounded-sm">
               <img 
                 src="/logos/logo-transparent.jpg"
                 alt="Company Logo" 
                 className="h-20 w-auto object-contain"
               />
             </div>
           </div>
           <div className="inline-block px-4 py-1.5 bg-gray-100 border border-lks-gold/30 rounded-full mb-4">
             <span className="text-xs font-bold text-lks-navy tracking-widest uppercase">Professional Translation Services</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-serif font-medium text-lks-navy mb-4">
             Excellence in Legal Translation
           </h2>
           <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
             Transform your legal documents across languages with unparalleled precision and confidentiality. Our enterprise-grade platform is specifically designed for the exacting standards of legal practice.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* If Processing or Complete, show the Feedback Component instead of the form */}
            {isProcessingOrComplete ? (
               <StatusFeedback state={state} onReset={handleReset} onViewHistory={() => setShowHistoryModal(true)} />
            ) : (
              <>
                {/* Step 1: Document Type */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:border-lks-gold/50 transition-colors">
                  <div className="bg-lks-navy px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-lks-gold text-lks-navy h-8 w-8 rounded flex items-center justify-center font-bold font-serif shadow-sm">1</div>
                      <h3 className="text-white font-serif text-lg tracking-wide">Document Classification</h3>
                    </div>
                    <span className="text-blue-200 text-xs uppercase tracking-wider">Select your document format</span>
                  </div>
                  <div className="p-8">
                    <CustomDropdown
                      options={DOCUMENT_TYPES.map(type => ({
                        id: type.id,
                        label: type.label.split(' (')[0],
                        extensions: type.extensions,
                        icon: null
                      }))}
                      value={state.docType}
                      onChange={(value) => {
                        const event = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
                        handleDocTypeChange(event);
                      }}
                      placeholder="Select document format..."
                      label="Document Type"
                    />
                  </div>
                </div>

                {/* Step 2: Language Configuration */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:border-lks-gold/50 transition-colors">
                  <div className="bg-lks-navy px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-lks-gold text-lks-navy h-8 w-8 rounded flex items-center justify-center font-bold font-serif shadow-sm">2</div>
                      <h3 className="text-white font-serif text-lg tracking-wide">Language Configuration</h3>
                    </div>
                    <span className="text-blue-200 text-xs uppercase tracking-wider">Define source and target languages</span>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <div className="flex items-center space-x-2 text-lks-gold text-sm font-semibold uppercase tracking-wider">
                           <LangIcon size={16} />
                           <span>Source Language</span>
                         </div>
                         <CustomDropdown
                           options={LANGUAGES.map(lang => ({
                             id: lang.code,
                             label: lang.name,
                             extensions: [],
                             icon: lang.code === 'auto' ? null : lang.code.split('-')[0].toUpperCase()
                           }))}
                           value={state.sourceLang}
                           onChange={(value) => setState(prev => ({...prev, sourceLang: value}))}
                           placeholder="From Language..."
                           label=""
                         />
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center space-x-2 text-lks-gold text-sm font-semibold uppercase tracking-wider">
                           <ArrowRight size={16} />
                           <span>Target Language</span>
                         </div>
                         <CustomDropdown
                           options={LANGUAGES.filter(l => l.code !== 'auto').map(lang => ({
                             id: lang.code,
                             label: lang.name,
                             extensions: [],
                             icon: lang.code.split('-')[0].toUpperCase()
                           }))}
                           value={state.targetLang}
                           onChange={(value) => setState(prev => ({...prev, targetLang: value}))}
                           placeholder="To Language..."
                           label=""
                         />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Document Upload */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:border-lks-gold/50 transition-colors">
                  <div className="bg-lks-navy px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-lks-gold text-lks-navy h-8 w-8 rounded flex items-center justify-center font-bold font-serif shadow-sm">3</div>
                      <h3 className="text-white font-serif text-lg tracking-wide">Document Upload</h3>
                    </div>
                    <span className="text-blue-200 text-xs uppercase tracking-wider">Secure file transfer</span>
                  </div>
                  <div className="p-8">
                    <FileUpload 
                      selectedDocType={selectedDocTypeOption}
                      selectedFile={state.file}
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                    />
                  </div>
                </div>

                {/* Primary Action */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={startTranslation}
                    disabled={!isReadyToTranslate}
                    className={`
                      relative overflow-hidden group px-8 py-4 rounded-md shadow-lg transition-all duration-300 transform
                      ${isReadyToTranslate 
                        ? 'bg-lks-navy text-white hover:bg-lks-navyLight hover:-translate-y-1' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                    style={{ minWidth: '240px' }}
                  >
                    <div className="relative z-10 flex items-center justify-center space-x-3 font-serif font-medium tracking-wide text-lg">
                       <span>Translate Document</span>
                       {isReadyToTranslate && <ArrowRight size={20} />}
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-lks-navy px-6 py-4 border-b border-lks-navyLight">
                 <h3 className="text-white font-serif text-lg tracking-wide">Progress</h3>
              </div>
              <div className="p-6 space-y-6">
                 {/* Step 1 Item */}
                 <div className="flex items-start space-x-4">
                    <div className={`mt-0.5 rounded-full p-0.5 ${getStepStatus(1) === 'completed' ? 'bg-lks-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
                       <CheckCircle2 size={20} className={getStepStatus(1) === 'completed' ? 'opacity-100' : 'opacity-0'} />
                    </div>
                    <div>
                       <p className={`text-sm font-semibold ${getStepStatus(1) === 'completed' ? 'text-lks-navy' : 'text-gray-500'}`}>Document Type</p>
                       <p className="text-xs text-gray-400">{getStepStatus(1) === 'completed' ? '✓ Selected' : 'Pending selection'}</p>
                    </div>
                 </div>

                 {/* Step 2 Item */}
                 <div className="flex items-start space-x-4">
                    <div className={`mt-0.5 rounded-full p-0.5 ${getStepStatus(2) === 'completed' ? 'bg-lks-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
                       <CheckCircle2 size={20} className={getStepStatus(2) === 'completed' ? 'opacity-100' : 'opacity-0'} />
                    </div>
                    <div>
                       <p className={`text-sm font-semibold ${getStepStatus(2) === 'completed' ? 'text-lks-navy' : 'text-gray-500'}`}>Languages</p>
                       <p className="text-xs text-gray-400">{getStepStatus(2) === 'completed' ? '✓ Configured' : 'Pending configuration'}</p>
                    </div>
                 </div>

                 {/* Step 3 Item */}
                 <div className="flex items-start space-x-4">
                    <div className={`mt-0.5 rounded-full p-0.5 ${getStepStatus(3) === 'completed' ? 'bg-lks-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
                       <CheckCircle2 size={20} className={getStepStatus(3) === 'completed' ? 'opacity-100' : 'opacity-0'} />
                    </div>
                    <div>
                       <p className={`text-sm font-semibold ${getStepStatus(3) === 'completed' ? 'text-lks-navy' : 'text-gray-500'}`}>File Upload</p>
                       <p className="text-xs text-gray-400">{getStepStatus(3) === 'completed' ? '✓ Ready' : 'Waiting for file'}</p>
                    </div>
                 </div>

                 {/* Step 4 Item */}
                 <div className="flex items-start space-x-4">
                    <div className={`mt-0.5 rounded-full p-0.5 ${getStepStatus(4) === 'completed' ? 'bg-lks-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
                       <CheckCircle2 size={20} className={getStepStatus(4) === 'completed' ? 'opacity-100' : 'opacity-0'} />
                    </div>
                    <div>
                       <p className={`text-sm font-semibold ${getStepStatus(4) === 'completed' ? 'text-lks-navy' : 'text-gray-500'}`}>Translation</p>
                       <p className="text-xs text-gray-400">{getStepStatus(4) === 'completed' ? '✓ Complete' : 'Ready to start'}</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-inner flex items-start space-x-4">
               <div className="p-3 bg-lks-navy text-lks-gold rounded-lg shadow-sm">
                  <ShieldCheck size={24} />
               </div>
               <div>
                 <h4 className="font-serif font-bold text-lks-navy">Bank-Level Security</h4>
                 <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                   Your documents are protected with military-grade encryption and automatically purged after processing.
                 </p>
               </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TranslatorApp;