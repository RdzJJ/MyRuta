/**
 * MyRuta Backend - Ruta Service
 * 
 * Responsibilities:
 * - CRUD operations for routes
 * - Get route details and stops
 * - Calculate estimated times
 * - Query route history
 */

import prisma from '../models/prismaClient.js';

export class RutaService {
  async getRoute(id) {
    try {
      const ruta = await prisma.ruta.findUnique({
        where: { id },
        include: {
          stops: {
            orderBy: { order: 'asc' },
          },
          conductors: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
        },
      });
      return ruta;
    } catch (error) {
      throw new Error(`Error fetching route: ${error.message}`);
    }
  }

  async listRoutes(filter = {}) {
    try {
      const { active = true, search = '', limit = 50, offset = 0 } = filter;

      const rutas = await prisma.ruta.findMany({
        where: {
          active,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { startStop: { contains: search, mode: 'insensitive' } },
            { endStop: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: {
          stops: {
            orderBy: { order: 'asc' },
          },
          conductors: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        take: limit,
        skip: offset,
      });

      return rutas;
    } catch (error) {
      throw new Error(`Error listing routes: ${error.message}`);
    }
  }

  async createRoute(data) {
    try {
      const { name, code, startStop, endStop, description } = data;

      const ruta = await prisma.ruta.create({
        data: {
          name,
          code,
          startStop,
          endStop,
          description,
          active: true,
        },
      });

      return ruta;
    } catch (error) {
      throw new Error(`Error creating route: ${error.message}`);
    }
  }

  async updateRoute(id, data) {
    try {
      const ruta = await prisma.ruta.update({
        where: { id },
        data,
        include: {
          stops: { orderBy: { order: 'asc' } },
        },
      });

      return ruta;
    } catch (error) {
      throw new Error(`Error updating route: ${error.message}`);
    }
  }

  async deleteRoute(id) {
    try {
      const ruta = await prisma.ruta.delete({
        where: { id },
      });

      return ruta;
    } catch (error) {
      throw new Error(`Error deleting route: ${error.message}`);
    }
  }

  async getStops(routeId) {
    try {
      const stops = await prisma.parada.findMany({
        where: { rutaId: routeId },
        orderBy: { order: 'asc' },
      });

      return stops;
    } catch (error) {
      throw new Error(`Error fetching stops: ${error.message}`);
    }
  }

  async calculateEstimatedTime(routeId, currentLocation, targetStop) {
    // Implementation coming later
    // This would integrate with Google Maps API
    throw new Error('Not implemented');
  }

  async getRoutesByCity(city = 'Medellín') {
    try {
      const rutas = await prisma.ruta.findMany({
        where: { active: true },
        include: {
          stops: {
            orderBy: { order: 'asc' },
          },
          conductors: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return rutas;
    } catch (error) {
      throw new Error(`Error fetching routes: ${error.message}`);
    }
  }
}

export default new RutaService();
