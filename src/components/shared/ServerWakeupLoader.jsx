import { useEffect, useState } from 'react';
import { FaServer, FaCoffee } from 'react-icons/fa';

const ServerWakeupLoader = ({ isLoading }) => {
  const [dots, setDots] = useState('');
  const [message, setMessage] = useState('Connecting to server');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      return;
    }

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Track elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Change message based on elapsed time
    const messageInterval = setInterval(() => {
      setElapsedTime(current => {
        if (current > 10 && current <= 20) {
          setMessage('Server is waking up');
        } else if (current > 20 && current <= 40) {
          setMessage('Please wait, loading your data');
        } else if (current > 40) {
          setMessage('Almost there');
        }
        return current;
      });
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timeInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
      <div className="text-center text-white">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          {elapsedTime > 10 ? (
            <FaCoffee className="text-8xl mx-auto animate-bounce" />
          ) : (
            <FaServer className="text-8xl mx-auto animate-pulse" />
          )}

          {/* Spinning Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold mb-2">
          {message}{dots}
        </h2>

        {/* Explanation for first-time users */}
        {elapsedTime > 5 && (
          <p className="text-lg opacity-90 mt-4 max-w-md mx-auto animate-fade-in">
            {elapsedTime > 10
              ? "Our free server was sleeping. We're waking it up for you! ☕"
              : "Loading your dashboard..."}
          </p>
        )}

        {/* Timer */}
        {elapsedTime > 3 && (
          <div className="mt-6 text-sm opacity-75">
            {elapsedTime}s
          </div>
        )}

        {/* Tip for long waits */}
        {elapsedTime > 30 && (
          <div className="mt-8 p-4 bg-white bg-opacity-20 rounded-lg max-w-md mx-auto animate-fade-in">
            <p className="text-sm">
              💡 <strong>Tip:</strong> This happens when the server hasn't been used for a while.
              Subsequent loads will be instant!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerWakeupLoader;
