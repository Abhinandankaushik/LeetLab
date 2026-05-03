import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const contests = await prisma.contest.findMany({
    select: {
      name: true,
      slug: true,
      id: true
    }
  });
  console.log(JSON.stringify(contests, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
