import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('open'); // 'before', 'open', 'closed'

  // Calculate time left until cart closes (9:00 PM)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();

      // Cart hours: 7:00 AM to 9:00 PM
      const cartOpenHour = 7;
      const cartCloseHour = 21;

      // Check if before cart opens (before 7:00 AM)
      if (currentHour < cartOpenHour) {
        setStatus('before');
        const cartOpenTime = new Date();
        cartOpenTime.setHours(cartOpenHour, 0, 0, 0);

        const diff = cartOpenTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
      // Check if cart is closed (after 9:00 PM)
      else if (currentHour >= cartCloseHour) {
        setStatus('closed');
        setTimeLeft('Cart Closed');
      }
      // Cart is open - show time until 9:00 PM
      else {
        setStatus('open');
        const cartCloseTime = new Date();
        cartCloseTime.setHours(cartCloseHour, 0, 0, 0);

        const diff = cartCloseTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  // Different colors based on cart status
  const getGradientClass = () => {
    if (status === 'before') return 'from-blue-500 to-blue-600';
    if (status === 'closed') return 'from-gray-500 to-gray-600';
    return 'from-primary to-primary-dark'; // open
  };

  const getStatusText = () => {
    if (status === 'before') return 'until cart opens';
    if (status === 'closed') return 'Opens at 7:00 AM';
    return 'left'; // cart is open
  };

  return (
    <div className="flex justify-end mb-4">
      <div className={`bg-gradient-to-r ${getGradientClass()} text-white px-3 py-1.5 rounded-full shadow-md flex items-center space-x-2`}>
        <FaClock className="text-sm animate-pulse" />
        <div className="flex items-center space-x-1">
          <span className="text-sm font-bold">{timeLeft}</span>
          <span className="text-xs opacity-75">{getStatusText()}</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
