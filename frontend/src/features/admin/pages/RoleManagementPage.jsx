import React, { useState } from 'react';
import { Shield, Plus, Search, Edit2, Trash2, Users, CheckSquare } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';
import RoleForm from '../components/RoleForm';

const RoleManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const mockRoles = [
    { id: 1, name: 'Admin', description: 'Full system access', userCount: 3, permissions: 45, status: 'system', createdAt: new Date('2024-01-01') },
    { id: 2, name: 'Warehouse Manager', description: 'Manage warehouse operations', userCount: 5, permissions: 28, status: 'active', createdAt: new Date('2024-02-15') },
    { id: 3, name: 'Quality Inspector', description: 'Quality control and batch management', userCount: 8, permissions: 18, status: 'active', createdAt: new Date('2024-03-10') },
    { id: 4, name: 'Inventory Operator', description: 'Stock management and transfers', userCount: 12, permissions: 15, status: 'active', createdAt: new Date('2024-04-05') },
    { id: 5, name: 'Viewer', description: 'Read-only access', userCount: 20, permissions: 5, status: 'active', createdAt: new Date('2024-05-20') },
  ];

  const filteredRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowRoleForm(true);
  };

  const handleDeleteRole = (role) => {
    if (role.status === 'system') {
      alert('System roles cannot be deleted');
      return;
    }
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('Deleting role:', roleToDelete);
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const columns = [
    { key: 'name', label: 'Role', render: (role) => (
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          role.status === 'system' ? 'bg-purple-100' : 'bg-blue-100'
        }`}>
          <Shield className={`w-5 h-5 ${
            role.status === 'system' ? 'text-purple-600' : 'text-blue-600'
          }`} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{role.name}</p>
          <p className="text-sm text-gray-500">{role.description}</p>
        </div>
      </div>
    )},
    { key: 'userCount', label: 'Users', render: (role) => (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <span>{role.userCount} users</span>
      </div>
    )},
    { key: 'permissions', label: 'Permissions', render: (role) => (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CheckSquare className="w-4 h-4" />
        <span>{role.permissions} permissions</span>
      </div>
    )},
    { key: 'status', label: 'Type', render: (role) => (
      <StatusBadge status={role.status === 'system' ? 'warning' : 'success'} size="sm" />
    )},
    { key: 'createdAt', label: 'Created', render: (role) => (
      <span className="text-sm text-gray-500">
        {new Date(role.createdAt).toLocaleDateString()}
      </span>
    )},
    { key: 'actions', label: '', render: (role) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleEditRole(role)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit role"
        >
          <Edit2 className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => handleDeleteRole(role)}
          className={`p-2 rounded-lg transition-colors ${
            role.status === 'system' 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'hover:bg-red-50'
          }`}
          title={role.status === 'system' ? 'System role cannot be deleted' : 'Delete role'}
          disabled={role.status === 'system'}
        >
          <Trash2 className={`w-4 h-4 ${
            role.status === 'system' ? 'text-gray-400' : 'text-red-600'
          }`} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-500 mt-1">Define roles and assign permissions</p>
        </div>
        <Button onClick={() => { setEditingRole(null); setShowRoleForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="max-w-md">
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Roles Table */}
      <DataTable
        columns={columns}
        data={filteredRoles}
        emptyMessage="No roles found"
      />

      {/* Role Form Modal */}
      {showRoleForm && (
        <RoleForm
          role={editingRole}
          onClose={() => { setShowRoleForm(false); setEditingRole(null); }}
          onSave={(roleData) => {
            console.log('Saving role:', roleData);
            setShowRoleForm(false);
            setEditingRole(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Role"
        message={`Are you sure you want to delete "${roleToDelete?.name}"? This will affect ${roleToDelete?.userCount} users.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default RoleManagementPage;
