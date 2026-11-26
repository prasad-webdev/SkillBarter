// Simple Prisma client — SQLite (local dev) or PostgreSQL (production)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export default prisma;
