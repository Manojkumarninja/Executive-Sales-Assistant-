import { useEffect, useState } from 'react';
import ninjacartOnlyLogo from '../../assets/Ninjacart-only-logo.png';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation to complete
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50"></div>

      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500 opacity-5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logo container with animations */}
      <div className="relative z-10 animate-fade-in">
        <div className="animate-bounce-gentle">
          <div className="w-64 h-64 flex items-center justify-center">
            <img
              src={ninjacartOnlyLogo}
              alt="Ninjacart"
              className="w-full h-full object-contain"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center mt-8 space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Loading text */}
        <p className="text-center mt-6 text-gray-600 font-medium animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
