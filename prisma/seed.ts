import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
  override: true,
});
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  'user:read',
  'user:create',
  'user:update',
  'user:delete',
  'role:read',
  'role:create',
  'role:update',
  'role:delete',
];

async function main() {
  // 1. Seed permissions
  const permissions = await Promise.all(
    PERMISSIONS.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  console.log(`Seeded ${permissions.length} permissions`);

  // 2. Seed roles (sidrainase: ADMIN + USER, sesuai FE dummy auth)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });
  console.log('Seeded roles: ADMIN, USER');

  // 3. Assign permissions to roles
  // ADMIN gets all permissions
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // USER gets only user:read
  const userReadPerm = permissions.find((p) => p.name === 'user:read')!;
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: userRole.id,
        permissionId: userReadPerm.id,
      },
    },
    update: {},
    create: { roleId: userRole.id, permissionId: userReadPerm.id },
  });
  console.log('Assigned permissions to roles');

  // 4. Seed admin user (match FE dummy: admin@drainase.com / admin123)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@drainase.com' },
    update: {},
    create: {
      email: 'admin@drainase.com',
      password: hashedAdminPassword,
      roleId: adminRole.id,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      fullName: 'Administrator',
    },
  });
  console.log('Seeded admin user:', admin.email);

  // 5. Seed regular user (match FE dummy: user@drainase.com / user123)
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@drainase.com' },
    update: {},
    create: {
      email: 'user@drainase.com',
      password: hashedUserPassword,
      roleId: userRole.id,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: 'Operator',
    },
  });
  console.log('Seeded regular user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
