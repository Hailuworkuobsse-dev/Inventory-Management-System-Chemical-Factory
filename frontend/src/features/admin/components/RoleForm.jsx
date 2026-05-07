import React, { useState, useEffect } from 'react';
import { X, Shield, CheckSquare, Save } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ConfirmDialog from '../../../components/ConfirmDialog';
import PermissionMatrix from './PermissionMatrix';

const RoleForm = ({ role, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || [],
      });
    }
  }, [role]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave({ ...formData, id: role?.id });
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePermissionsChange = (permissions) => {
    setFormData(prev => ({ ...prev, permissions }));
  };

  const handleClose = () => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || [],
    });
    
    if (hasChanges) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmCloseForm = () => {
    setConfirmClose(false);
    onClose();
  };

  const isSystemRole = role?.status === 'system';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {role ? 'Edit Role' : 'Create New Role'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Role Details
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'permissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Permissions
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter role name"
                      disabled={isSystemRole}
                      className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the role's responsibilities"
                    rows={3}
                    disabled={isSystemRole}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {isSystemRole && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      This is a system role. Some fields are locked to prevent accidental changes.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Permission Assignment</h3>
                    <p className="text-sm text-gray-500">Select the permissions for this role</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.permissions.length} selected
                  </div>
                </div>
                
                <PermissionMatrix
                  selectedPermissions={formData.permissions}
                  onChange={handlePermissionsChange}
                  readOnly={isSystemRole}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isSystemRole}
                className="flex-1"
              >
                {isSubmitting ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Close Dialog */}
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={confirmCloseForm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="warning"
      />
    </>
  );
};

export default RoleForm;
