import { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';

const CertificateList = ({ certificates = [] }) => {
  const [filter, setFilter] = useState('all');

  // Mock certificates data
  const defaultCertificates = [
    { id: 1, name: 'ISO 9001:2015', type: 'Quality Management', issueDate: '2023-06-15', expiryDate: '2026-06-14', status: 'valid', fileUrl: '#' },
    { id: 2, name: 'CE Marking', type: 'Product Safety', issueDate: '2023-08-20', expiryDate: '2025-08-19', status: 'valid', fileUrl: '#' },
    { id: 3, name: 'Organic Certification', type: 'Environmental', issueDate: '2023-03-10', expiryDate: '2024-03-09', status: 'expiring_soon', fileUrl: '#' },
    { id: 4, name: 'Safety Data Sheet', type: 'Safety', issueDate: '2022-12-01', expiryDate: '2024-01-15', status: 'expired', fileUrl: '#' },
  ];

  const certList = certificates.length > 0 ? certificates : defaultCertificates;

  const filteredCertificates = filter === 'all' 
    ? certList 
    : certList.filter(cert => cert.status === filter);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Certificates & Documents</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="valid">Valid</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Certificate List */}
      <div className="divide-y divide-gray-200">
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No certificates found
          </div>
        ) : (
          filteredCertificates.map((cert) => (
            <div key={cert.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(cert.status)}`}>
                        {formatStatus(cert.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{cert.type}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                      <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="View Certificate"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <a
                    href={cert.fileUrl}
                    download
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total: {certList.length} certificates
          </span>
          <div className="flex items-center gap-4">
            <span className="text-green-600">
              Valid: {certList.filter(c => c.status === 'valid').length}
            </span>
            <span className="text-yellow-600">
              Expiring: {certList.filter(c => c.status === 'expiring_soon').length}
            </span>
            <span className="text-red-600">
              Expired: {certList.filter(c => c.status === 'expired').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateList;
