import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const contests = await prisma.contest.findMany({
    select: { name: true, slug: true }
  });
  console.log(JSON.stringify(contests, null, 2));
}

main().finally(() => prisma.$disconnect());
