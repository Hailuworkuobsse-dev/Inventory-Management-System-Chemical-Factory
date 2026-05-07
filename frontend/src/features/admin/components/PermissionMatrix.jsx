import React, { useState } from 'react';
import { CheckSquare, Square, ChevronRight, ChevronDown, Shield, Users, Package, FileText, Settings, TrendingUp, ClipboardCheck, Truck, DollarSign } from 'lucide-react';

const permissionCategories = [
  {
    id: 'inventory',
    name: 'Inventory Management',
    icon: Package,
    permissions: [
      { id: 'inventory:view', label: 'View Stock Levels' },
      { id: 'inventory:create', label: 'Create Stock Entries' },
      { id: 'inventory:edit', label: 'Edit Stock Records' },
      { id: 'inventory:delete', label: 'Delete Stock Records' },
      { id: 'inventory:transfer', label: 'Transfer Stock' },
      { id: 'inventory:adjust', label: 'Adjust Inventory' },
      { id: 'inventory:receipt', label: 'Process Receipts' },
    ],
  },
  {
    id: 'quality',
    name: 'Quality Control',
    icon: ClipboardCheck,
    permissions: [
      { id: 'quality:view', label: 'View Quality Records' },
      { id: 'quality:create', label: 'Create Test Records' },
      { id: 'quality:approve', label: 'Approve Batches' },
      { id: 'quality:reject', label: 'Reject Batches' },
      { id: 'quality:recall', label: 'Initiate Recall' },
      { id: 'quality:certificate', label: 'Manage Certificates' },
    ],
  },
  {
    id: 'procurement',
    name: 'Procurement',
    icon: Truck,
    permissions: [
      { id: 'procurement:view', label: 'View Purchase Orders' },
      { id: 'procurement:create', label: 'Create Purchase Orders' },
      { id: 'procurement:edit', label: 'Edit Purchase Orders' },
      { id: 'procurement:approve', label: 'Approve POs' },
      { id: 'procurement:supplier', label: 'Manage Suppliers' },
      { id: 'procurement:forex', label: 'Manage Forex' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales & Orders',
    icon: DollarSign,
    permissions: [
      { id: 'sales:view', label: 'View Orders' },
      { id: 'sales:create', label: 'Create Orders' },
      { id: 'sales:edit', label: 'Edit Orders' },
      { id: 'sales:delete', label: 'Cancel Orders' },
      { id: 'sales:return', label: 'Process Returns' },
      { id: 'sales:shipment', label: 'Manage Shipments' },
    ],
  },
  {
    id: 'production',
    name: 'Production',
    icon: Settings,
    permissions: [
      { id: 'production:view', label: 'View Work Orders' },
      { id: 'production:create', label: 'Create Work Orders' },
      { id: 'production:bom', label: 'Manage BOMs' },
      { id: 'production:consume', label: 'Record Consumption' },
      { id: 'production:yield', label: 'Record Yield' },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    icon: TrendingUp,
    permissions: [
      { id: 'reports:view', label: 'View Reports' },
      { id: 'reports:export', label: 'Export Data' },
      { id: 'reports:custom', label: 'Create Custom Reports' },
      { id: 'reports:schedule', label: 'Schedule Reports' },
    ],
  },
  {
    id: 'admin',
    name: 'Administration',
    icon: Shield,
    permissions: [
      { id: 'admin:users', label: 'Manage Users' },
      { id: 'admin:roles', label: 'Manage Roles' },
      { id: 'admin:settings', label: 'System Settings' },
      { id: 'admin:audit', label: 'View Audit Logs' },
      { id: 'admin:backup', label: 'Manage Backups' },
    ],
  },
];

const PermissionMatrix = ({ selectedPermissions = [], onChange, readOnly = false }) => {
  const [expandedCategories, setExpandedCategories] = useState(
    permissionCategories.map(cat => cat.id)
  );

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const togglePermission = (permissionId) => {
    if (readOnly) return;
    
    const newPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];
    
    onChange?.(newPermissions);
  };

  const toggleAllInCategory = (categoryPermissions) => {
    if (readOnly) return;
    
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p.id));
    
    if (allSelected) {
      const newPermissions = selectedPermissions.filter(
        id => !categoryPermissions.some(p => p.id === id)
      );
      onChange?.(newPermissions);
    } else {
      const newPermissions = [
        ...selectedPermissions,
        ...categoryPermissions.filter(p => !selectedPermissions.includes(p.id)).map(p => p.id),
      ];
      onChange?.(newPermissions);
    }
  };

  const selectAll = () => {
    if (readOnly) return;
    const allPermissions = permissionCategories.flatMap(cat => cat.permissions.map(p => p.id));
    onChange?.(allPermissions);
  };

  const deselectAll = () => {
    if (readOnly) return;
    onChange?.([]);
  };

  const getCategoryProgress = (categoryPermissions) => {
    const selected = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
    return Math.round((selected / categoryPermissions.length) * 100);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header Actions */}
      {!readOnly && (
        <div className="flex justify-end gap-2 p-3 bg-gray-50 border-b border-gray-200">
          <Button variant="secondary" size="sm" onClick={selectAll}>Select All</Button>
          <Button variant="secondary" size="sm" onClick={deselectAll}>Deselect All</Button>
        </div>
      )}

      {/* Categories */}
      <div className="divide-y divide-gray-200">
        {permissionCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(category.id);
          const progress = getCategoryProgress(category.permissions);
          const allSelected = category.permissions.every(p => selectedPermissions.includes(p.id));
          const someSelected = category.permissions.some(p => selectedPermissions.includes(p.id));

          return (
            <div key={category.id}>
              {/* Category Header */}
              <div
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  readOnly ? '' : 'select-none'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <button className="p-1 hover:bg-gray-200 rounded">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                <div className={`p-2 rounded-lg ${
                  allSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    allSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <span className="text-xs text-gray-500">
                      {category.permissions.filter(p => selectedPermissions.includes(p.id)).length} / {category.permissions.length}
                    </span>
                  </div>
                  <div className="mt-1 w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllInCategory(category.permissions);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : someSelected ? (
                      <div className="relative">
                        <Square className="w-5 h-5 text-gray-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                        </div>
                      </div>
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                )}
              </div>

              {/* Permissions List */}
              {isExpanded && (
                <div className="bg-gray-50 px-4 py-2 space-y-1">
                  {category.permissions.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission.id);
                    
                    return (
                      <label
                        key={permission.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white transition-colors ${
                          readOnly ? '' : 'select-none'
                        }`}
                      >
                        {!readOnly ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        ) : (
                          isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )
                        )}
                        <span className={`text-sm ${
                          isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {permission.label}
                        </span>
                        <code className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                          {permission.id}
                        </code>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple Button component for internal use
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PermissionMatrix;
