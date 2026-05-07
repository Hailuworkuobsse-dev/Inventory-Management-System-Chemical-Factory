import React, { useState } from 'react';
import { Users, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Shield, Mail, Phone } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';
import UserForm from '../components/UserForm';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', department: 'Warehouse', lastActive: new Date() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'active', department: 'Quality', lastActive: new Date(Date.now() - 3600000) },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Operator', status: 'inactive', department: 'Inventory', lastActive: new Date(Date.now() - 86400000) },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Viewer', status: 'active', department: 'Sales', lastActive: new Date() },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('Deleting user:', userToDelete);
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const columns = [
    { key: 'name', label: 'User', render: (user) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.department}</p>
        </div>
      </div>
    )},
    { key: 'email', label: 'Contact', render: (user) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          {user.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          +1 (555) 123-4567
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (user) => (
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium">{user.role}</span>
      </div>
    )},
    { key: 'status', label: 'Status', render: (user) => (
      <StatusBadge status={user.status} size="sm" />
    )},
    { key: 'lastActive', label: 'Last Active', render: (user) => (
      <span className="text-sm text-gray-500">
        {new Date(user.lastActive).toLocaleDateString()}
      </span>
    )},
    { key: 'actions', label: '', render: (user) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleEditUser(user)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit user"
        >
          <Edit2 className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => handleDeleteUser(user)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete user"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setShowUserForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="operator">Operator</option>
            <option value="viewer">Viewer</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyMessage="No users found"
      />

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onClose={() => { setShowUserForm(false); setEditingUser(null); }}
          onSave={(userData) => {
            console.log('Saving user:', userData);
            setShowUserForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default UserManagementPage;
