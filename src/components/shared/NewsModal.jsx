import { FaTimes, FaBullhorn, FaNewspaper } from 'react-icons/fa';

const NewsModal = ({ isOpen, onClose, newsItems }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaBullhorn className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Important Updates</h2>
                <p className="text-white text-opacity-90 text-sm">Latest news and announcements</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            {newsItems && newsItems.length > 0 ? (
              <div className="space-y-4">
                {newsItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.type === 'announcement'
                            ? 'bg-blue-100 text-blue-600'
                            : item.type === 'update'
                            ? 'bg-green-100 text-green-600'
                            : item.type === 'alert'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          <FaNewspaper className="text-lg" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                          {item.badge && (
                            <span className="px-2 py-1 bg-danger text-white text-xs font-bold rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-2 leading-relaxed">{item.content}</p>

                        {item.date && (
                          <p className="text-xs text-gray-500">
                            📅 {item.date}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaNewspaper className="text-6xl text-gray-300 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg font-semibold">No news available</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for updates</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsModal;
