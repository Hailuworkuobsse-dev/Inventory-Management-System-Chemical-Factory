import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, Building, Phone } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ConfirmDialog from '../../../components/ConfirmDialog';

const UserForm = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
    department: '',
    phone: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role?.toLowerCase() || 'viewer',
        department: user.department || '',
        phone: user.phone || '',
        status: user.status || 'active',
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave({ ...formData, id: user?.id });
    } catch (error) {
      console.error('Error saving user:', error);
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

  const handleClose = () => {
    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role?.toLowerCase() || 'viewer',
      department: user?.department || '',
      phone: user?.phone || '',
      status: user?.status || 'active',
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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="operator">Operator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select department</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Quality">Quality</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Sales">Sales</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>

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
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
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

export default UserForm;
