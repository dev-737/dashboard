import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

async function main() {
  console.log('Starting backfill of hub counts...');

  const hubs = await db.hub.findMany({
    select: {
      id: true,
      _count: {
        select: {
          connections: { where: { connected: true } },
          reviews: true,
        },
      },
    },
  });

  console.log(`Found ${hubs.length} hubs to update.`);

  let updated = 0;
  for (const hub of hubs) {
    await db.hub.update({
      where: { id: hub.id },
      data: {
        connectionCount: hub._count.connections,
        reviewCount: hub._count.reviews,
      },
    });
    updated++;
    if (updated % 50 === 0) {
      console.log(`Updated ${updated}/${hubs.length} hubs...`);
    }
  }

  console.log('Backfill complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
