
import React from 'react';
import Logo from './Logo';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-indigo-600 dark:bg-indigo-900 z-50 flex flex-col items-center justify-center transition-colors duration-500">
      <div className="animate-bounce mb-6">
        <div className="shadow-2xl rounded-3xl rotate-3">
            <Logo className="w-32 h-32" inverted={true} />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight animate-pulse">
        LinguaStory AI
      </h1>
      <div className="mt-8 flex space-x-2">
        <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce delay-75"></div>
        <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce delay-150"></div>
        <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
