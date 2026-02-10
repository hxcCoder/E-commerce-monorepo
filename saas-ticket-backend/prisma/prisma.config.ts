import { PrismaClient } from '../src/generated/prisma';

// Instanciamos el cliente usando la ruta donde se genera
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'dev' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;