import { useState } from 'react';
import { FlaskConical, Plus, Save } from 'lucide-react';

const LabTestForm = ({ batchId, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    batchId: batchId || '',
    testType: '',
    testName: '',
    parameters: [],
    results: [],
    notes: '',
    inspector: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(Date.now());
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Form Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FlaskConical className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">Laboratory Test</h2>
          <p className="text-sm text-gray-500">Record quality test results for batch</p>
        </div>
      </div>

      {/* Batch Selection */}
      {!batchId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
          <input
            type="text"
            value={formData.batchId}
            onChange={(e) => handleInputChange('batchId', e.target.value)}
            placeholder="Enter or scan batch number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      )}

      {/* Test Type & Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
          <select
            value={formData.testType}
            onChange={(e) => handleInputChange('testType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select test type</option>
            <option value="physical">Physical Inspection</option>
            <option value="chemical">Chemical Analysis</option>
            <option value="microbiological">Microbiological Test</option>
            <option value="dimensional">Dimensional Check</option>
            <option value="functional">Functional Test</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
          <input
            type="text"
            value={formData.testName}
            onChange={(e) => handleInputChange('testName', e.target.value)}
            placeholder="e.g., Visual Quality Check"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Inspector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Inspector *</label>
        <input
          type="text"
          value={formData.inspector}
          onChange={(e) => handleInputChange('inspector', e.target.value)}
          placeholder="Enter inspector name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Test Parameters - Placeholder */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Test Parameters</h3>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Parameter
          </button>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No parameters added. Click "Add Parameter" to define test criteria.</p>
        </div>
      </div>

      {/* Test Results - Placeholder */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="conditional">Conditional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Measured Value</label>
              <input
                type="text"
                placeholder="Enter measured value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acceptable Range</label>
              <input
                type="text"
                placeholder="e.g., 95-105"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          placeholder="Add observations, comments, or special conditions..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.testType || !formData.testName || !formData.inspector}
          className="px-4 py-2 border border-transparent rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Test Results'}
        </button>
      </div>
    </form>
  );
};

export default LabTestForm;
