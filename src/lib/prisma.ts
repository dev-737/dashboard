'server only';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@/lib/generated/prisma/client/client';

const globalForDb = global as unknown as { db: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);

export const db = globalForDb.db || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
