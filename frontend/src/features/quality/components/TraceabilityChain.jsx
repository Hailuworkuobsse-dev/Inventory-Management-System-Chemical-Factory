import { useState } from 'react';
import { Package, Factory, Truck, CheckCircle, AlertTriangle } from 'lucide-react';

const TraceabilityChain = ({ batchId }) => {
  // Mock traceability data - would come from API in real app
  const [traceData] = useState({
    origin: {
      type: 'supplier',
      name: 'ABC Supplies',
      location: 'Addis Ababa, Ethiopia',
      date: '2024-01-05',
      status: 'verified',
    },
    production: {
      type: 'manufacturing',
      name: 'Main Production Line',
      location: 'Factory A',
      date: '2024-01-10',
      status: 'completed',
    },
    quality: {
      type: 'quality_check',
      name: 'QC Inspection',
      location: 'Lab 1',
      date: '2024-01-11',
      status: 'passed',
    },
    warehouse: {
      type: 'storage',
      name: 'Main Warehouse',
      location: 'Zone A-01',
      date: '2024-01-12',
      status: 'stored',
    },
  });

  const steps = [
    {
      id: 'origin',
      title: 'Raw Material Source',
      icon: Factory,
      data: traceData.origin,
    },
    {
      id: 'production',
      title: 'Production',
      icon: Package,
      data: traceData.production,
    },
    {
      id: 'quality',
      title: 'Quality Control',
      icon: CheckCircle,
      data: traceData.quality,
    },
    {
      id: 'warehouse',
      title: 'Warehousing',
      icon: Truck,
      data: traceData.warehouse,
    },
  ];

  const getStatusIcon = (status) => {
    if (status === 'verified' || status === 'completed' || status === 'passed' || status === 'stored') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Traceability Chain</h3>
      
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Icon Circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-white shadow flex items-center justify-center">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      {getStatusIcon(step.data.status)}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Name:</span> {step.data.name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Location:</span> {step.data.location}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Date:</span> {new Date(step.data.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Status:</span>{' '}
                        <span className="capitalize">{step.data.status}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connection Dot */}
                {!isLast && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Info Footer */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Batch ID:</span>
          <span className="font-mono font-medium text-gray-900">{batchId}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-500">Traceability Score:</span>
          <span className="font-medium text-green-600">100% Complete</span>
        </div>
      </div>
    </div>
  );
};

export default TraceabilityChain;
