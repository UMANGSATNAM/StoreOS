import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Enable WAL mode for better concurrent access (SQLite)
// Use $queryRaw since PRAGMA journal_mode returns a result row
if (typeof window === 'undefined') {
  db.$queryRaw<Array<{journal_mode: string}>>`PRAGMA journal_mode=WAL`.catch(() => {
    // WAL mode setup is best-effort; ignore errors
  })
}