/**
 * MyRuta Backend - Database Seeding Script
 * Creates initial admin user and sample data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/utils/logger.js';

const prisma = new PrismaClient();

async function main() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('Admin@2026', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@myruta.com' },
      update: {},
      create: {
        email: 'admin@myruta.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'MyRuta',
        phone: '+573001234567',
        role: 'ADMIN',
        active: true,
        admin: {
          create: {},
        },
      },
      include: {
        admin: true,
      },
    });

    logger.info(`✓ Admin user created: ${adminUser.email}`);

    // Create Sample Cliente User
    const clientePassword = await bcrypt.hash('Cliente@2026', 10);
    
    const clienteUser = await prisma.user.upsert({
      where: { email: 'cliente@myruta.com' },
      update: {},
      create: {
        email: 'cliente@myruta.com',
        password: clientePassword,
        firstName: 'Juan',
        lastName: 'Pasajero',
        phone: '+573009876543',
        role: 'CLIENTE',
        active: true,
        cliente: {
          create: {
            address: 'Calle 10 #5-20, Bogotá',
            preferences: JSON.stringify({ language: 'es', notifications: true }),
          },
        },
      },
      include: {
        cliente: true,
      },
    });

    logger.info(`✓ Cliente user created: ${clienteUser.email}`);

    // Create Sample Route
    const sampleRoute = await prisma.ruta.upsert({
      where: { code: 'R001' },
      update: {},
      create: {
        name: 'Ruta Centro - Norte',
        code: 'R001',
        startStop: 'Centro Comercial',
        endStop: 'Estación Norte',
        description: 'Ruta principal de conexión centro-norte',
        active: true,
      },
    });

    logger.info(`✓ Sample route created: ${sampleRoute.name} (${sampleRoute.code})`);

    // Create Bus Stops for Route
    const stops = [
      { name: 'Centro Comercial', latitude: 4.7110, longitude: -74.0055, order: 1 },
      { name: 'Plaza Mayor', latitude: 4.7150, longitude: -74.0045, order: 2 },
      { name: 'Parque Central', latitude: 4.7200, longitude: -74.0035, order: 3 },
      { name: 'Estación Centro', latitude: 4.7250, longitude: -74.0025, order: 4 },
      { name: 'Calle 72', latitude: 4.7300, longitude: -74.0020, order: 5 },
      { name: 'Estación Norte', latitude: 4.7350, longitude: -74.0010, order: 6 },
    ];

    let stopsCreated = 0;
    for (const stop of stops) {
      try {
        await prisma.parada.create({
          data: {
            rutaId: sampleRoute.id,
            name: stop.name,
            latitude: stop.latitude,
            longitude: stop.longitude,
            order: stop.order,
          },
        });
        stopsCreated++;
      } catch (error) {
        logger.warn(`Could not create stop ${stop.name}: ${error.message}`);
      }
    }

    logger.info(`✓ ${stopsCreated} bus stops created for route ${sampleRoute.code}`);

    // Create Sample Conductor User
    const conductorPassword = await bcrypt.hash('Conductor@2026', 10);
    
    const conductorUser = await prisma.user.upsert({
      where: { email: 'conductor@myruta.com' },
      update: {},
      create: {
        email: 'conductor@myruta.com',
        password: conductorPassword,
        firstName: 'Carlos',
        lastName: 'Conductor',
        phone: '+573005551111',
        role: 'CONDUCTOR',
        active: true,
        conductor: {
          create: {
            licenseNo: 'LIC001234567',
            licenseExpiry: new Date('2028-12-31'),
            vehicle: 'Mercedes Benz Sprinter',
            plateNo: 'ABC-1234',
            active: true,
            assignedRouteId: sampleRoute.id,
          },
        },
      },
      include: {
        conductor: true,
      },
    });

    logger.info(`✓ Conductor user created: ${conductorUser.email}`);

    logger.info('✅ Database seeding completed successfully!');
    logger.info('═════════════════════════════════════════');
    logger.info('📝 USER CREDENTIALS:');
    logger.info('');
    logger.info('👨‍💼 ADMIN:');
    logger.info('   Email: admin@myruta.com');
    logger.info('   Password: Admin@2026');
    logger.info('');
    logger.info('👤 CLIENTE:');
    logger.info('   Email: cliente@myruta.com');
    logger.info('   Password: Cliente@2026');
    logger.info('');
    logger.info('🚌 CONDUCTOR:');
    logger.info('   Email: conductor@myruta.com');
    logger.info('   Password: Conductor@2026');
    logger.info('═════════════════════════════════════════');

  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
