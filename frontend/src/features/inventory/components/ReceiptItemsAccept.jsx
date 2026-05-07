import { useState } from 'react';
import { Plus, Trash2, ScanLine } from 'lucide-react';
import ScanInput from '../../../components/ScanInput';
import BinSelectorModal from './BinSelectorModal';

const ReceiptItemsAccept = ({ items = [], onItemsChange }) => {
  const [showBinSelector, setShowBinSelector] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState('');

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      sku: '',
      name: '',
      barcode: '',
      expectedQuantity: 0,
      receivedQuantity: 0,
      unit: 'pcs',
      batchNumber: '',
      expiryDate: '',
      binLocation: '',
      notes: '',
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onItemsChange(updatedItems);
  };

  const handleScan = (barcode) => {
    setScannedBarcode(barcode);
    // Auto-populate item based on barcode (mock implementation)
    // In real app, this would call an API to fetch product details
  };

  const openBinSelector = (index) => {
    setCurrentItemIndex(index);
    setShowBinSelector(true);
  };

  const handleBinSelect = (binLocation) => {
    if (currentItemIndex !== null) {
      handleItemChange(currentItemIndex, 'binLocation', binLocation);
    }
    setShowBinSelector(false);
    setCurrentItemIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Receipt Items</h3>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No items added yet. Click "Add Item" to start.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Barcode Scan */}
                <div className="lg:col-span-3">
                  <ScanInput
                    value={scannedBarcode}
                    onChange={setScannedBarcode}
                    onScan={handleScan}
                    placeholder="Scan barcode or enter manually..."
                    label="Barcode"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Product Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Expected Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Qty *</label>
                  <input
                    type="number"
                    value={item.expectedQuantity}
                    onChange={(e) => handleItemChange(index, 'expectedQuantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>

                {/* Received Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received Qty *</label>
                  <input
                    type="number"
                    value={item.receivedQuantity}
                    onChange={(e) => handleItemChange(index, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="g">Grams</option>
                    <option value="l">Liters</option>
                    <option value="ml">Milliliters</option>
                    <option value="m">Meters</option>
                    <option value="box">Boxes</option>
                  </select>
                </div>

                {/* Batch Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={item.batchNumber}
                    onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Bin Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bin Location</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.binLocation}
                      onChange={(e) => handleItemChange(index, 'binLocation', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => openBinSelector(index)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Select
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={item.notes}
                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bin Selector Modal */}
      {showBinSelector && (
        <BinSelectorModal
          onSelect={handleBinSelect}
          onClose={() => {
            setShowBinSelector(false);
            setCurrentItemIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default ReceiptItemsAccept;
