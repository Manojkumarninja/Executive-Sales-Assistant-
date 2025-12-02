import { FaTimes, FaBox, FaWeight, FaCalendar } from 'react-icons/fa';

const TodaysOrdersSKUModal = ({ isOpen, onClose, customer, skus }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header - Fixed at top */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold mb-1">Today's Orders - SKU Details</h2>
            <p className="text-blue-100">
              Customer: <span className="font-semibold">{customer?.customerName}</span> (ID: {customer?.customerId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {skus && skus.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaBox className="mr-2 text-blue-600" />
                  SKU Items ({skus.length})
                </h3>
              </div>

              {/* SKU Cards */}
              <div className="grid gap-4">
                {skus.map((sku, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-blue-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                          {sku.skuName}
                        </h4>
                        <p className="text-sm text-gray-600">SKU ID: {sku.skuId}</p>
                      </div>
                      {sku.date && (
                        <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                          <FaCalendar className="mr-2 text-blue-600" />
                          <span>{sku.date}</span>
                        </div>
                      )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Order Qty */}
                      <div className="bg-white p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center mb-1">
                          <FaBox className="text-purple-600 mr-2" />
                          <span className="text-xs text-gray-600 font-medium">Order Qty</span>
                        </div>
                        <p className="text-xl font-bold text-purple-600">
                          {sku.orderQty ? sku.orderQty.toFixed(0) : '0'}
                        </p>
                      </div>

                      {/* Order Kg */}
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-1">
                          <FaWeight className="text-blue-600 mr-2" />
                          <span className="text-xs text-gray-600 font-medium">Order Kg</span>
                        </div>
                        <p className="text-xl font-bold text-blue-600">
                          {sku.orderKg ? sku.orderKg.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No SKU details available</p>
            </div>
          )}
        </div>

        {/* Footer - Always visible at bottom */}
        <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-600">
            Total Items: <span className="font-semibold text-gray-900">{skus?.length || 0}</span>
          </div>
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

export default TodaysOrdersSKUModal;
