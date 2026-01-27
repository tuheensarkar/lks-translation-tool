import React from 'react';
import Header from '../Header';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-lks-navy font-serif">
                        {title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {subtitle}
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                        {children}
                    </div>
                </div>
            </div>

            <div className="py-4 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} LKS Multilingual Document Translator. All rights reserved.
            </div>
        </div>
    );
};

export default AuthLayout;
