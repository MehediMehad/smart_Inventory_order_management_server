import type { Prisma } from '@prisma/client';
import { UserRoleEnum, UserStatusEnum } from '@prisma/client';

import config from '../../../configs';
import prisma from '../../libs/prisma';
import { authHelpers } from '../authHelpers';

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await prisma.user.findFirst({
      where: {
        role: UserRoleEnum.ADMIN,
      },
    });

    if (isSuperAdminExists) {
      console.log('⚠️  Super Admin already exists.');
      return;
    }
    const hashedPassword = await authHelpers.hashPassword(config.admin.password);

    const superAdminData: Prisma.UserCreateInput = {
      name: 'Super Admin',
      image: '00000000',
      password: hashedPassword,
      email: config.admin.email,
      phone: '000000000',
      role: UserRoleEnum.ADMIN,
      status: UserStatusEnum.ACTIVE,
      isVerified: true,
    };

    await prisma.user.create({
      data: superAdminData,
    });

    console.log('✅ Super Admin created successfully.');
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error);
  }
};

export default seedSuperAdmin;
