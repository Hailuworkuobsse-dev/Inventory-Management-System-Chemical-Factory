import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export default function ExportButtons({ reportName }) {
  const handleExport = (format) => {
    console.log(`Exporting ${reportName} as ${format}`);
    // In real app: trigger download
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('pdf')}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
      >
        <FileText size={18} />
        PDF
      </button>
      <button
        onClick={() => handleExport('excel')}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
      >
        <FileSpreadsheet size={18} />
        Excel
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
      >
        <Download size={18} />
        CSV
      </button>
    </div>
  );
}
