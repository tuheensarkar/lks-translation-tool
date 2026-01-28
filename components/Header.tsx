import React from 'react';
import { Lock, BadgeCheck, ShieldCheck, User, LogOut, History } from './ui/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/signin');
  };
  
  return (
    <header className="relative bg-navy-gradient text-white shadow-lg border-b-4 border-lks-gold overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-pattern opacity-50 pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Company Logo */}
          <div className="flex items-center">
  <div className="bg-white p-2 rounded-sm">
    <img
      src="/logos/logo-transparent.jpg"
      alt="LKS Logo"
      className="w-20 md:w-24 h-auto object-contain"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement!.nextElementSibling!.style.display = 'flex';
      }}
    />
  </div>

  {/* Fallback text logo */}
  <div className="hidden flex-col items-center leading-none bg-white p-2 rounded-sm">
    <span className="font-serif text-3xl text-lks-navy font-bold tracking-widest">
      LKS
    </span>
  </div>
</div>

          
          <div className="hidden md:block border-l border-white/20 h-12"></div>
          
          <div className="hidden md:block">
            <h1 className="text-2xl font-serif font-medium tracking-wide text-white">
              Multilingual Document Translator
            </h1>
            <div className="flex items-center space-x-2 text-lks-gold text-xs uppercase tracking-widest font-medium mt-1">
              <ShieldCheck size={12} />
              <span>Secure Legal Document Translation & Conversion Platform</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Info */}
          {user && (
            <div className="hidden md:flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-lks-gold" />
                <div className="text-sm">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-lks-gold/80 capitalize">{user.role}</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="p-1 rounded hover:bg-white/10 transition-colors mr-2"
                title="Translation History"
              >
                <History size={14} className="text-white" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Logout"
              >
                <LogOut size={14} className="text-white" />
              </button>
            </div>
          )}
          
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded border border-white/20 bg-white/5 backdrop-blur-sm">
            <Lock size={14} className="text-lks-gold" />
            <span className="text-xs font-medium tracking-wider">Encrypted</span>
          </div>
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded border border-white/20 bg-white/5 backdrop-blur-sm">
            <BadgeCheck size={14} className="text-lks-gold" />
            <span className="text-xs font-medium tracking-wider">Certified</span>
          </div>
        </div>
      </div>
    </header>
  );
};


export default Header;