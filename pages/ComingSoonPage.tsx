import React from 'react';

interface ComingSoonPageProps {
    title: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
    // A simple function to capitalize the first letter of the title
    const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">{formattedTitle}</h1>
            <p className="text-lg text-gray-600">This feature is currently under construction.</p>
            <p className="text-gray-500">We're working hard to bring it to you. Please check back later for updates!</p>
            <div className="mt-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </div>
        </div>
    );
};

export default ComingSoonPage;
