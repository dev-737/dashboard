import { PrismaClient } from "@/lib/generated/prisma/client/client";
import { PrismaPg } from '@prisma/adapter-pg'

const globalForDb = global as unknown as { db: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
export const db = new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
