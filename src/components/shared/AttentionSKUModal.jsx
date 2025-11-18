import { useEffect, useState } from 'react';
import { FaTimes, FaBox, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const AttentionSKUModal = ({ isOpen, onClose, customer, metric }) => {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer && metric) {
      fetchSKUDetails();
    }
  }, [isOpen, customer, metric]);

  const fetchSKUDetails = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found');
        setSkus([]);
        setLoading(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/attention/sku-details/${user.employee_id}/${customer.customerId}?metric=${encodeURIComponent(metric)}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.skus) {
        setSkus(data.skus);
      } else {
        console.warn('No SKU data found');
        setSkus([]);
      }
    } catch (error) {
      console.error('Error fetching SKU details:', error);
      setSkus([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FaBox className="mr-3" />
              SKU Details - {customer?.customerName}
            </h2>
            <p className="text-sm opacity-90 mt-1">Metric: {metric}</p>
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : skus.length > 0 ? (
            <div className="space-y-4">
              {skus.map((sku, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                >
                  {/* SKU Header */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <FaBox className="text-primary mr-2" />
                          {sku.skuName}
                        </h3>
                        {metric === 'All' && sku.metric && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                            {sku.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">SKU ID: {sku.skuId}</p>
                    </div>
                    <div className="text-right">
                      {sku.date && (
                        <p className="text-sm text-gray-600">{sku.date}</p>
                      )}
                      {sku.onTime !== null && (
                        <div className={`mt-1 flex items-center justify-end text-sm ${sku.onTime ? 'text-green-600' : 'text-orange-600'}`}>
                          {sku.onTime ? (
                            <>
                              <FaCheck className="mr-1" />
                              <span>On Time</span>
                            </>
                          ) : (
                            <>
                              <FaExclamationTriangle className="mr-1" />
                              <span>Late</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SKU Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Order Kg */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Order (Kg)</p>
                      <p className="text-lg font-bold text-gray-900">{sku.orderKg?.toFixed(2) || '0.00'}</p>
                    </div>

                    {/* Billed Kg */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Billed (Kg)</p>
                      <p className="text-lg font-bold text-green-600">{sku.billedKg?.toFixed(2) || '0.00'}</p>
                    </div>

                    {/* Sale Kg */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Sale (Kg)</p>
                      <p className="text-lg font-bold text-blue-600">{sku.saleKg?.toFixed(2) || '0.00'}</p>
                    </div>

                    {/* Return Kg */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Return (Kg)</p>
                      <p className="text-lg font-bold text-red-600">{sku.returnKg?.toFixed(2) || '0.00'}</p>
                    </div>

                    {/* Readjustment Kg */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Readjustment (Kg)</p>
                      <p className="text-lg font-bold text-orange-600">{sku.readjustmentKg?.toFixed(2) || '0.00'}</p>
                    </div>

                    {/* Shop Reach Time */}
                    {sku.shopReachTime && (
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <FaClock className="mr-1" />
                          Shop Reach Time
                        </p>
                        <p className="text-lg font-bold text-purple-600">{sku.shopReachTime}</p>
                      </div>
                    )}
                  </div>

                  {/* Net Calculation (if applicable) */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700">Net Delivery</p>
                        <p className="text-xl font-bold text-primary">
                          {((sku.billedKg || 0) - (sku.returnKg || 0) - (sku.readjustmentKg || 0)).toFixed(2)} Kg
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Billed - Return - Readjustment
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-600 text-lg">No SKU details found for this customer</p>
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

export default AttentionSKUModal;
