import { FaPhone, FaUser, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { trackCustomerCall } from '../../utils/analytics';

const CustomerListCard = ({ title, subtitle, customers, showDistance = false, showLastSeen = false, showLastOrder = false, icon, iconColor = 'text-primary', source = 'unknown' }) => {
  const handleCallClick = (customer) => {
    // Track the call event
    trackCustomerCall({
      ...customer,
      source: source
    });

    // Initiate the phone call
    window.location.href = `tel:${customer.phoneNumber}`;
  };
  return (
    <div className="card p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          {icon && <span className={`text-2xl mr-2 ${iconColor}`}>{icon}</span>}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Customer List - Scrollable */}
      <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
        {customers.map((customer) => (
          <div
            key={customer.customerId}
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              {/* Customer Info */}
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <FaUser className="text-gray-400 mr-2 text-sm" />
                  <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
                </div>

                <div className="space-y-1 ml-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium text-gray-500 w-24">ID:</span>
                    <span className="text-gray-700">{customer.customerId}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-2 text-primary" />
                    <a href={`tel:${customer.phoneNumber}`} className="text-primary hover:underline">
                      {customer.phoneNumber}
                    </a>
                  </div>

                  {showDistance && customer.distance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-warning" />
                      <span className="font-semibold text-warning">{customer.distance}</span>
                      {customer.location && (
                        <span className="ml-2 text-gray-500">• {customer.location}</span>
                      )}
                    </div>
                  )}

                  {showLastSeen && customer.lastSeen && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-success" />
                      <span className="text-success font-medium">{customer.lastSeen}</span>
                    </div>
                  )}

                  {showLastOrder && customer.lastOrder && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-2" />
                      <span>Last order: {customer.lastOrder}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCallClick(customer)}
                className="ml-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                Call
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {customers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{customers.length}</span> customers
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerListCard;
