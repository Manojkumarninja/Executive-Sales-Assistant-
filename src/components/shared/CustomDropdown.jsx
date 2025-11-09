import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheckCircle } from 'react-icons/fa';

const CustomDropdown = ({ options, value, onChange, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-5 py-2.5 pr-12 font-semibold text-gray-800 hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer min-w-[220px] shadow-sm w-full text-left"
      >
        <span className={selectedOption ? 'text-gray-800' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <FaChevronDown
            className={`text-primary text-sm transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 animate-fade-in">
          <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden backdrop-blur-sm">
            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    value === option.value
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg transform scale-105'
                      : 'bg-white hover:bg-purple-50 text-gray-700 hover:text-primary hover:shadow-md hover:transform hover:scale-102'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {value === option.value && (
                    <FaCheckCircle className="text-white text-lg ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
