const crypto = require('node:crypto');
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();
const email = 'admin.teste@fixtech.local';
const password = 'FixTech@2026';
const salt = crypto.randomBytes(16).toString('hex');
const passwordHash = `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString('hex')}`;

async function main() {
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Administrador de Teste',
      passwordHash,
      role: 'ADMIN',
      active: true,
    },
    create: {
      name: 'Administrador de Teste',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Test user ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
