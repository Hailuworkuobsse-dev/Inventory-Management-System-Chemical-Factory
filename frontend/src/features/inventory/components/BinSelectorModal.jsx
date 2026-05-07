import { useState } from 'react';
import { X, Search } from 'lucide-react';

const BinSelectorModal = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBin, setSelectedBin] = useState(null);

  // Mock bin locations - would come from API in real app
  const bins = [
    { id: 'A-01-01', warehouse: 'Main Warehouse', zone: 'A', aisle: '01', shelf: '01', capacity: 1000, currentLoad: 450 },
    { id: 'A-01-02', warehouse: 'Main Warehouse', zone: 'A', aisle: '01', shelf: '02', capacity: 1000, currentLoad: 200 },
    { id: 'A-02-01', warehouse: 'Main Warehouse', zone: 'A', aisle: '02', shelf: '01', capacity: 500, currentLoad: 100 },
    { id: 'B-01-01', warehouse: 'Main Warehouse', zone: 'B', aisle: '01', shelf: '01', capacity: 800, currentLoad: 600 },
    { id: 'B-01-02', warehouse: 'Main Warehouse', zone: 'B', aisle: '01', shelf: '02', capacity: 800, currentLoad: 150 },
    { id: 'C-01-01', warehouse: 'Cold Storage', zone: 'C', aisle: '01', shelf: '01', capacity: 300, currentLoad: 250 },
  ];

  const filteredBins = bins.filter(bin =>
    bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bin.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bin.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedBin) {
      onSelect(selectedBin.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Select Bin Location</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 pb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by bin ID, warehouse, or zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bin List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {filteredBins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bins found matching your search.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBins.map((bin) => (
                  <div
                    key={bin.id}
                    onClick={() => setSelectedBin(bin)}
                    className={`
                      p-4 border rounded-lg cursor-pointer transition-colors
                      ${selectedBin?.id === bin.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{bin.id}</p>
                        <p className="text-sm text-gray-500">{bin.warehouse}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Zone: {bin.zone}</p>
                        <p className="text-sm text-gray-500">
                          Load: {bin.currentLoad} / {bin.capacity}
                        </p>
                        <div className="mt-1 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              (bin.currentLoad / bin.capacity) > 0.9
                                ? 'bg-red-500'
                                : (bin.currentLoad / bin.capacity) > 0.7
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${(bin.currentLoad / bin.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSelect}
              disabled={!selectedBin}
              className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Bin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinSelectorModal;
