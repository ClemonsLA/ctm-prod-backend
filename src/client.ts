import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query
export default prisma