import { useState } from 'react';
import { Settings, Download, Upload, AlertTriangle } from 'lucide-react';

export default function ExportConfigForm({ onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    format: 'xml',
    includeHeader: true,
    dateFormat: 'YYYY-MM-DD',
    decimalSeparator: '.',
    encoding: 'UTF-8',
    compression: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(config);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} />
          Export Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Format</label>
            <select
              value={config.format}
              onChange={(e) => setConfig({ ...config, format: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="xml">XML</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel (.xlsx)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={config.dateFormat}
              onChange={(e) => setConfig({ ...config, dateFormat: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Separator</label>
            <select
              value={config.decimalSeparator}
              onChange={(e) => setConfig({ ...config, decimalSeparator: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value=".">Period (.)</option>
              <option value=",">Comma (,)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Character Encoding</label>
            <select
              value={config.encoding}
              onChange={(e) => setConfig({ ...config, encoding: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTF-8">UTF-8</option>
              <option value="ISO-8859-1">ISO-8859-1</option>
              <option value="Windows-1252">Windows-1252</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <div className="font-medium">Include Header Row</div>
              <div className="text-sm text-gray-500">Add column headers to exported file</div>
            </div>
            <input
              type="checkbox"
              checked={config.includeHeader}
              onChange={(e) => setConfig({ ...config, includeHeader: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <div className="font-medium">Enable Compression</div>
              <div className="text-sm text-gray-500">Compress output file (ZIP)</div>
            </div>
            <input
              type="checkbox"
              checked={config.compression}
              onChange={(e) => setConfig({ ...config, compression: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> Ensure the export configuration matches your compliance requirements. 
            Incorrect settings may result in rejected filings.
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}
