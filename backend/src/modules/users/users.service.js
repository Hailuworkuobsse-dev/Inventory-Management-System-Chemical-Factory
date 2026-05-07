const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { AppError } = require('../../utils/customErrors');
const auditService = require('../../services/audit.service');

const prisma = new PrismaClient();

/**
 * Create a user
 */
async function createUser(data, userId) {
  const { email, password, firstName, lastName, roleId, phone, isActive } = data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      isActive,
      role: {
        connect: { id: roleId }
      }
    },
    include: { role: true }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'USER_CREATED',
    entityType: 'User',
    entityId: user.id,
    details: { email, roleId }
  });

  // Return without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Update user
 */
async function updateUser(userId, data, actorId) {
  const { firstName, lastName, phone, roleId, isActive } = data;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (roleId) updateData.roleId = roleId;
  if (isActive !== undefined) updateData.isActive = isActive;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { role: true }
  });

  await auditService.logAction(prisma, {
    userId: actorId,
    action: 'USER_UPDATED',
    entityType: 'User',
    entityId: userId,
    details: { updates: Object.keys(updateData) }
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Create a role
 */
async function createRole(data, userId) {
  const { name, description, permissions } = data;

  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions: permissions || []
    }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'ROLE_CREATED',
    entityType: 'Role',
    entityId: role.id,
    details: { name }
  });

  return role;
}

/**
 * Assign permissions to a role
 */
async function assignPermissions(roleId, permissions, userId) {
  const role = await prisma.role.update({
    where: { id: roleId },
    data: { permissions }
  });

  await auditService.logAction(prisma, {
    userId,
    action: 'PERMISSIONS_ASSIGNED',
    entityType: 'Role',
    entityId: roleId,
    details: { permissionCount: permissions.length }
  });

  return role;
}

/**
 * Get user permissions
 */
async function getUserPermissions(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    userId: user.id,
    email: user.email,
    roleId: user.role?.id,
    roleName: user.role?.name,
    permissions: user.role?.permissions || []
  };
}

/**
 * Get all roles
 */
async function getAllRoles() {
  return prisma.role.findMany({
    include: {
      users: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

/**
 * Delete a role
 */
async function deleteRole(roleId, userId) {
  // Check if role is assigned to any users
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { users: true }
  });

  if (!role) throw new AppError('Role not found', 404);
  if (role.users.length > 0) {
    throw new AppError('Cannot delete role assigned to users', 400);
  }

  await prisma.role.delete({ where: { id: roleId } });

  await auditService.logAction(prisma, {
    userId,
    action: 'ROLE_DELETED',
    entityType: 'Role',
    entityId: roleId
  });

  return { success: true };
}

module.exports = {
  createUser,
  updateUser,
  createRole,
  assignPermissions,
  getUserPermissions,
  getAllRoles,
  deleteRole
};
