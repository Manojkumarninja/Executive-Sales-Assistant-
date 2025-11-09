import { useCallback } from 'react';
import { FaUser, FaCog, FaBell, FaQuestionCircle, FaFileAlt, FaShieldAlt, FaChartLine, FaAward } from 'react-icons/fa';
import PullToRefresh from '../components/shared/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

const More = () => {
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Refreshing...');
    window.location.reload();
  }, []);

  const { isRefreshing } = usePullToRefresh(handleRefresh);
  const menuItems = [
    {
      icon: FaUser,
      title: 'Profile',
      description: 'View and edit your profile information',
      color: 'blue',
      action: () => alert('TODO: Navigate to Profile page'),
    },
    {
      icon: FaCog,
      title: 'Settings',
      description: 'Configure app preferences and options',
      color: 'gray',
      action: () => alert('TODO: Navigate to Settings page'),
    },
    {
      icon: FaBell,
      title: 'Notifications',
      description: 'Manage your notification preferences',
      color: 'yellow',
      action: () => alert('TODO: Navigate to Notifications page'),
    },
    {
      icon: FaChartLine,
      title: 'Reports',
      description: 'Generate and download performance reports',
      color: 'green',
      action: () => alert('TODO: Navigate to Reports page'),
    },
    {
      icon: FaAward,
      title: 'Achievements',
      description: 'View your badges and milestones',
      color: 'purple',
      action: () => alert('TODO: Navigate to Achievements page'),
    },
    {
      icon: FaFileAlt,
      title: 'Documentation',
      description: 'Access user guides and resources',
      color: 'indigo',
      action: () => alert('TODO: Navigate to Documentation page'),
    },
    {
      icon: FaShieldAlt,
      title: 'Privacy & Security',
      description: 'Manage your privacy and security settings',
      color: 'red',
      action: () => alert('TODO: Navigate to Privacy page'),
    },
    {
      icon: FaQuestionCircle,
      title: 'Help & Support',
      description: 'Get help or contact support team',
      color: 'cyan',
      action: () => alert('TODO: Navigate to Support page'),
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-500',
      gray: 'bg-gray-500 text-gray-500',
      yellow: 'bg-yellow-500 text-yellow-500',
      green: 'bg-green-500 text-green-500',
      purple: 'bg-purple-500 text-purple-500',
      indigo: 'bg-indigo-500 text-indigo-500',
      red: 'bg-red-500 text-red-500',
      cyan: 'bg-cyan-500 text-cyan-500',
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <PullToRefresh isRefreshing={isRefreshing} />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">More Options</h1>
        <p className="text-gray-600">Access additional features and settings</p>
      </div>

      {/* User Info Card */}
      <div className="card p-6 mb-6 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <FaUser className="text-4xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">Sales Executive</h2>
            <p className="opacity-90">executive@company.com</p>
            <p className="text-sm opacity-75 mt-1">Member since Jan 2024</p>
          </div>
          <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {menuItems.map((item, index) => {
          const colors = getColorClasses(item.color).split(' ');
          const bgColor = colors[0];
          const textColor = colors[1];

          return (
            <button
              key={index}
              onClick={item.action}
              className="card p-6 text-left hover:shadow-card-hover transform hover:scale-105 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${bgColor} bg-opacity-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className={`text-2xl ${textColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </button>
          );
        })}
      </div>

      {/* App Info */}
      <div className="card p-6 bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sales Executive App</h3>
          <p className="text-sm text-gray-600 mb-4">Version 1.0.0</p>
          <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
            This application is designed to help sales executives track their performance, manage targets,
            and maximize their earnings. Built with modern web technologies for optimal performance.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
          </div>
        </div>
      </div>

      {/* Development Note */}
      <div className="mt-6 card p-4 bg-purple-50 border border-purple-200">
        <p className="text-sm text-purple-800 text-center">
          <span className="font-semibold">Developer Note:</span> These pages are placeholders.
          Replace alert() calls with actual navigation and functionality as needed.
        </p>
      </div>
    </div>
    </>
  );
};

export default More;
