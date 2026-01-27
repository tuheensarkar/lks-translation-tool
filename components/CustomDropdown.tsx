import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText, FileType } from "./ui/Icons";

interface DropdownOption {
  id: string;
  label: string;
  extensions: string[];
  icon?: string | null;
  iconColor?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);
  
  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getFileIcon = (optionId?: string) => {
    if (!optionId) return <FileType className="h-5 w-5 text-lks-navy shrink-0" />;
    
    switch(optionId) {
      case 'pdf':
        return <FileType className="h-5 w-5 text-red-600 shrink-0" />;
      case 'word':
        return <FileText className="h-5 w-5 text-blue-600 shrink-0" />;
      case 'excel':
        return <FileText className="h-5 w-5 text-green-600 shrink-0" />;
      case 'powerpoint':
        return <FileText className="h-5 w-5 text-orange-500 shrink-0" />;
      case 'text':
        return <FileText className="h-5 w-5 text-gray-600 shrink-0" />;
      case 'opendoc':
        return <FileText className="h-5 w-5 text-purple-600 shrink-0" />;
      case 'web':
        return <FileText className="h-5 w-5 text-indigo-600 shrink-0" />;
      case 'image':
        return <FileText className="h-5 w-5 text-pink-500 shrink-0" />;
      default:
        return <FileType className="h-5 w-5 text-gray-700 shrink-0" />;
    }
  };

  // Check if this is a language dropdown (has icon as string code)
  const isLanguageDropdown = options.some(opt => typeof opt.icon === 'string' && opt.icon !== null);

  const renderLanguageBadge = (code: string) => {
    return (
      <div 
        className="flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold text-gray-700 bg-gray-100"
      >
        {code}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Label - only show if provided */}
      {label && (
        <div className="flex items-center gap-2 text-lks-gold text-sm font-semibold uppercase tracking-wider">
          <FileText size={16} />
          {label}
        </div>
      )}

      {/* WRAPPER (ANCHOR) */}
      <div ref={wrapperRef} className="relative w-full">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 text-left shadow-sm hover:border-lks-navy focus:outline-none focus:ring-2 focus:ring-lks-navy"
        >
          <div className="flex items-center gap-3">
            {selectedOption ? (
              <>
                {isLanguageDropdown ? (
                  // Language display
                  <>
                    {selectedOption.icon && renderLanguageBadge(selectedOption.icon)}
                    <span className="font-medium text-gray-900">
                      {selectedOption.label}
                    </span>
                  </>
                ) : (
                  // Document type display
                  <>
                    {getFileIcon(selectedOption.id)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedOption.label}
                      </div>
                      {selectedOption.extensions.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {selectedOption.extensions.join(", ")}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>

          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* DROPDOWN (IN FLOW, SCROLLABLE) */}
        {isOpen && (
          <div className="mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {/* Search input for language options */}
            {isLanguageDropdown && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lks-navy focus:border-lks-navy"
                  onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking search
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearchTerm(''); // Clear search after selection
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                      selectedOption?.id === option.id
                        ? "bg-lks-gold/10 border-l-4 border-l-lks-gold"
                        : ""
                    }`}
                  >
                    {isLanguageDropdown ? (
                      // Language option
                      <>
                        {option.icon && renderLanguageBadge(option.icon)}
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                      </>
                    ) : (
                      // Document type option
                      <>
                        {getFileIcon(option.id)}
                        <div>
                          <div className="font-medium text-gray-900">
                            {option.label}
                          </div>
                          {option.extensions.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {option.extensions.join(", ")}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No languages found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;