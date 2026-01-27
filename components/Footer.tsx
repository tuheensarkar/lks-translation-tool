import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-gradient text-white mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-white/80">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} Lakshmikumaran & Sridharan Attorneys. All rights reserved.
          </p>
          <div className="mt-2 md:mt-0 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-red-500 font-medium">Confidential – For internal and authorized client use only.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;