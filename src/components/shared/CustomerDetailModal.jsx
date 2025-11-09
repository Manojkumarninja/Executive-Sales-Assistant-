import { FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaClock, FaBox, FaChartLine } from 'react-icons/fa';
import { trackCustomerCall } from '../../utils/analytics';

const CustomerDetailModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  const handleCallClick = () => {
    // Track the call event
    trackCustomerCall({
      customerId: customer.customerId,
      customerName: customer.customerName,
      phoneNumber: customer.phoneNumber,
      source: customer.source || 'target-page'
    });

    // Initiate the phone call
    window.location.href = `tel:${customer.phoneNumber}`;
  };

  // Get SKU data from customer object
  const skusToPitch = customer.skusToPitch || (customer.skuId && customer.sku ? [
    {
      id: customer.skuId,
      name: customer.sku,
      category: 'Product',
      image: '📦'
    }
  ] : []);

  // Debug logging
  console.log('Customer data:', customer);
  console.log('SKU data - skuId:', customer.skuId, 'sku:', customer.sku);
  console.log('SKUs to pitch:', skusToPitch);

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
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-fade-in"
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

            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-3xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{customer.customerName}</h2>
                <div className="space-y-1 text-white text-opacity-90">
                  <p className="text-sm flex items-center">
                    <span className="font-semibold mr-2">ID:</span> {customer.customerId}
                  </p>
                  <p className="text-sm flex items-center">
                    <FaPhone className="mr-2" />
                    {customer.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
            {/* Customer Details */}
            {(customer.distance || customer.lastSeen) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {customer.distance && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaMapMarkerAlt className="text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Distance</span>
                    </div>
                    <p className="text-lg font-bold text-green-900">{customer.distance}</p>
                  </div>
                )}

                {customer.lastSeen && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaChartLine className="text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800">Last Seen</span>
                    </div>
                    <p className="text-lg font-bold text-purple-900">{customer.lastSeen}</p>
                  </div>
                )}
              </div>
            )}

            {/* SKUs to Pitch */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaBox className="text-primary text-xl" />
                <h3 className="text-xl font-bold text-gray-900">SKUs to Pitch</h3>
              </div>

              {skusToPitch.length > 0 ? (
                <div className="space-y-3">
                  {skusToPitch.map((sku, index) => (
                    <div
                      key={sku.id || index}
                      className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        {/* SKU Image/Icon */}
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-4xl shadow-sm flex-shrink-0">
                          {sku.image || '📦'}
                        </div>

                        {/* SKU Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{sku.name}</h4>
                              {sku.category && <p className="text-sm text-gray-600">{sku.category}</p>}
                            </div>
                            {sku.price && (
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{sku.price}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">SKU ID: {sku.id}</span>
                            {sku.stock && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                sku.stock === 'In Stock'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {sku.stock}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <FaBox className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No SKU information available for this customer</p>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> These SKUs are recommended based on this customer's purchase history and current inventory levels.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Close
            </button>
            <button
              onClick={handleCallClick}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all flex items-center space-x-2"
            >
              <FaPhone />
              <span>Call Customer</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailModal;
