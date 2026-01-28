import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TranslationHistory from '../components/TranslationHistory';

const TranslationHistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-lks-text bg-gray-50">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-lks-navy mb-2">Translation Archive</h1>
          <p className="text-gray-600">View and manage your translation history</p>
        </div>
        
        <TranslationHistory />
      </main>
      
      <Footer />
    </div>
  );
};

export default TranslationHistoryPage;