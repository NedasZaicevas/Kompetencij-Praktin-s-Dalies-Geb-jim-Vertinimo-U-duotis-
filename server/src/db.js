import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const { PrismaClient } = pkg;

const u = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: u.hostname,                         // docker'e bus db
  port: u.port ? Number(u.port) : 3306,
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.slice(1),
});

export const prisma = new PrismaClient({ adapter });
