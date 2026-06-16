import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/index.js";

const globalForPrisma = globalThis;

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export { PrismaClient };
export * from "./generated/prisma/index.js";
