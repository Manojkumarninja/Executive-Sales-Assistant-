import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaBullseye,
  FaMoneyBillWave,
  FaEllipsisH,
  FaSignOutAlt,
} from 'react-icons/fa';
import NinjacartLogo from '../shared/NinjacartLogo';
import ninjacartLogoImg from '../../assets/ninjacart-logo.png';

const Sidebar = ({ onLogout, isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();

  // Static menu items
  const menuItems = [
    { name: 'Home', path: '/home', icon: FaHome },
    { name: 'Customers', path: '/target', icon: FaBullseye },
    // DISABLED: Earnings and More tabs
    // { name: 'Earnings', path: '/earnings', icon: FaMoneyBillWave },
    // { name: 'More', path: '/more', icon: FaEllipsisH },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen gradient-bg transition-all duration-300 ease-in-out z-50 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col w-full py-6">
          {/* Logo */}
          <div className="flex items-center justify-center px-4 mb-8">
            {isExpanded ? (
              <div className="transform scale-50 overflow-hidden">
                <NinjacartLogo size="small" className="brightness-0 invert" />
              </div>
            ) : (
              <div className="w-12 h-12 relative overflow-hidden">
                <img
                  src={ninjacartLogoImg}
                  alt="Ninjacart"
                  className="w-full h-full object-cover scale-150 brightness-0 invert"
                  style={{ objectPosition: 'center' }}
                />
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white shadow-lg'
                          : 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-10'
                      }`
                    }
                  >
                    <item.icon className="text-xl flex-shrink-0" />
                    {isExpanded && (
                      <span className="ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="px-3">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 rounded-lg text-white text-opacity-80 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              <FaSignOutAlt className="text-xl flex-shrink-0" />
              {isExpanded && (
                <span className="ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {menuItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500'
                }`
              }
            >
              <item.icon className="text-xl mb-1" />
              <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500 transition-all duration-200"
          >
            <FaSignOutAlt className="text-xl mb-1" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
