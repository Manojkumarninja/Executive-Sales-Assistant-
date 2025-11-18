import { FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaCalendar, FaTag, FaBuilding, FaMoneyBillWave } from 'react-icons/fa';

const BaseCustomerDetailModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FaUser className="mr-3" />
              {customer.customerName}
            </h2>
            <p className="text-sm opacity-90 mt-1">Customer ID: {customer.customerId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <FaPhone className="text-blue-600 mr-2" />
              Contact Information
            </h3>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center">
                <FaPhone className="text-blue-600 mr-3" />
                <span className="text-lg font-semibold text-blue-700">{customer.phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer Type */}
            {customer.customerType && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaTag className="text-purple-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Customer Type</h4>
                </div>
                <p className="text-gray-900">{customer.customerType}</p>
              </div>
            )}

            {/* Customer Nature */}
            {customer.customerNature && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaTag className="text-pink-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Customer Nature</h4>
                </div>
                <p className="text-gray-900">{customer.customerNature}</p>
              </div>
            )}

            {/* Cluster */}
            {customer.cluster && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaBuilding className="text-orange-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Cluster</h4>
                </div>
                <p className="text-gray-900">{customer.cluster}</p>
              </div>
            )}

            {/* Last Order Date */}
            {customer.lastOrderDate && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FaCalendar className="text-green-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Last Order Date</h4>
                </div>
                <p className="text-gray-900">{customer.lastOrderDate}</p>
              </div>
            )}
          </div>

          {/* Location Information */}
          {(customer.locality || customer.facility) && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FaMapMarkerAlt className="text-red-600 mr-2" />
                Location Information
              </h3>
              <div className="space-y-3">
                {customer.locality && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-1">Locality</h4>
                    <p className="text-gray-900">{customer.locality}</p>
                  </div>
                )}
                {customer.facility && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-1">Facility</h4>
                    <p className="text-gray-900">{customer.facility}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Information */}
          {(customer.subscriptionEndDate || customer.subscriptionAmount) && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FaMoneyBillWave className="text-green-600 mr-2" />
                Subscription Information
              </h3>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.subscriptionEndDate && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">End Date</h4>
                      <p className="text-gray-900">{customer.subscriptionEndDate}</p>
                    </div>
                  )}
                  {customer.subscriptionAmount && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Amount</h4>
                      <p className="text-gray-900 text-xl font-bold">₹{customer.subscriptionAmount.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseCustomerDetailModal;
