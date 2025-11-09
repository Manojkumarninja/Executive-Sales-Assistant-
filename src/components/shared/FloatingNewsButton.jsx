import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import NewsModal from './NewsModal';
import { trackNewsViewed } from '../../utils/analytics';

const API_BASE_URL = 'http://localhost:5000/api';

const FloatingNewsButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/notifications`);
        const data = await response.json();

        if (data.success && data.notifications) {
          setNewsItems(data.notifications);

          // Check if there are unread notifications
          // For now, we'll assume all notifications are unread initially
          const unread = data.notifications.length;
          setHasUnread(unread > 0);
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to empty array on error
        setNewsItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Mark as read when opened
    setHasUnread(false);
    setUnreadCount(0);

    // Track news viewed event
    trackNewsViewed();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpenModal}
        className="fixed top-20 right-4 md:top-24 md:right-8 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
        aria-label="View news and updates"
      >
        <FaBell className="text-xl animate-pulse" />

        {/* Notification Badge */}
        {hasUnread && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </div>
        )}

        {/* Pulse Ring Effect */}
        {hasUnread && (
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
        )}
      </button>

      {/* News Modal */}
      <NewsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        newsItems={newsItems}
      />
    </>
  );
};

export default FloatingNewsButton;
