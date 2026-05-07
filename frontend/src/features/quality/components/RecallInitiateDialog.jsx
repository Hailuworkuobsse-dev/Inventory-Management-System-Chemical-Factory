import { useState } from 'react';
import { X, AlertTriangle, Search } from 'lucide-react';

const RecallInitiateDialog = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    batchNumber: '',
    productCode: '',
    productName: '',
    reason: '',
    affectedQuantity: '',
    distributionScope: 'domestic',
    severity: 'medium',
    description: '',
    correctiveAction: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Simulate API call
    setTimeout(() => {
      onSuccess(Date.now());
    }, 1000);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.batchNumber && formData.productCode;
      case 2:
        return formData.reason && formData.affectedQuantity && formData.description;
      case 3:
        return formData.distributionScope && formData.severity && formData.correctiveAction;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Initiate Product Recall</h3>
                <p className="text-sm text-gray-500">Step {step} of 3</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      s <= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-full h-1 mx-2 ${
                        s < step ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                      style={{ width: '100px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Product Identification</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                      placeholder="Enter or scan batch number"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Code *</label>
                    <input
                      type="text"
                      value={formData.productCode}
                      onChange={(e) => handleInputChange('productCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Recall Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Recall *</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select reason</option>
                    <option value="quality">Quality Issue</option>
                    <option value="safety">Safety Concern</option>
                    <option value="contamination">Contamination</option>
                    <option value="mislabeling">Mislabeling</option>
                    <option value="regulatory">Regulatory Non-Compliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Affected Quantity *</label>
                  <input
                    type="number"
                    value={formData.affectedQuantity}
                    onChange={(e) => handleInputChange('affectedQuantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Scope & Actions</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distribution Scope *</label>
                    <select
                      value={formData.distributionScope}
                      onChange={(e) => handleInputChange('distributionScope', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="domestic">Domestic Only</option>
                      <option value="regional">Regional</option>
                      <option value="international">International</option>
                      <option value="global">Global</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level *</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => handleInputChange('severity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">Low - Minor Issue</option>
                      <option value="medium">Medium - Moderate Risk</option>
                      <option value="high">High - Serious Risk</option>
                      <option value="critical">Critical - Life Threatening</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Corrective Action Plan *</label>
                  <textarea
                    value={formData.correctiveAction}
                    onChange={(e) => handleInputChange('correctiveAction', e.target.value)}
                    rows={4}
                    placeholder="Describe the corrective actions to be taken..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              {step === 3 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Initiate Recall
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(Math.min(3, step + 1))}
                  disabled={!canProceed()}
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecallInitiateDialog;
