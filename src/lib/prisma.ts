'server only';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client/client';

const globalForDb = global as unknown as { db: PrismaClient };

const adapter = new PrismaPg(process.env.DATABASE_URL!);

export const db = globalForDb.db || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
