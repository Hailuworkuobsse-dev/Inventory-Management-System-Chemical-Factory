const prisma = require('../../utils/prisma');
const AppError = require('../../utils/appError');
const bcrypt = require('bcryptjs');

const usersService = {
  async listUsers(query) {
    const { role, isActive, search, page = '1', limit = '20' } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          roles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      items: users,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  },

  async getUser(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        auditLogs: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Remove password from response
    delete user.password;
    return user;
  },

  async createUser(data, creatorId) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new AppError('Email already in use', 400, 'VALIDATION_ERROR');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        isActive: data.isActive ?? true,
        warehouseId: data.warehouseId ? parseInt(data.warehouseId) : null,
        roles: data.roleIds ? {
          create: data.roleIds.map(roleId => ({
            roleId: parseInt(roleId),
            grantedById: creatorId
          }))
        } : undefined
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    delete user.password;
    return user;
  },

  async updateUser(id, data, updaterId) {
    const updateData = { ...data };

    // Handle password update separately
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    if (data.warehouseId) {
      updateData.warehouseId = parseInt(data.warehouseId);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    delete user.password;
    return user;
  },

  async deleteUser(id, deleterId) {
    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    return { success: true };
  },

  async assignRole(userId, roleId, granterId) {
    await prisma.userRole.create({
      data: {
        userId: parseInt(userId),
        roleId: parseInt(roleId),
        grantedById: granterId
      }
    });

    return this.getUser(userId);
  },

  async removeRole(userId, roleId, granterId) {
    await prisma.userRole.deleteMany({
      where: {
        userId: parseInt(userId),
        roleId: parseInt(roleId)
      }
    });

    return this.getUser(userId);
  },

  async listRoles() {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return roles;
  },

  async createRole(data, creatorId) {
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds ? {
          connect: data.permissionIds.map(id => ({ id: parseInt(id) }))
        } : undefined
      },
      include: {
        permissions: true
      }
    });

    return role;
  },

  async updateRole(id, data, updaterId) {
    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    if (data.permissionIds) {
      updateData.permissions = {
        set: data.permissionIds.map(pid => ({ id: parseInt(pid) }))
      };
    }

    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        permissions: true
      }
    });

    return role;
  },

  async getPermissions() {
    const permissions = await prisma.permission.findMany({
      orderBy: { name: 'asc' }
    });
    return permissions;
  }
};

module.exports = usersService;