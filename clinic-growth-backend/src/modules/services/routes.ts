import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { services, type NewService, type Service } from '../../db/schema.js';
import { eq, and, desc, like, sql } from 'drizzle-orm';

export default async function servicesRoutes(fastify: FastifyInstance) {
  // GET /api/services - List all services
  fastify.get('/', async (request, reply) => {
    const { tenantId, category, search } = request.query as { tenantId?: string; category?: string; search?: string };
    
    const conditions = [];
    if (tenantId) conditions.push(eq(services.tenantId, tenantId));
    if (category) conditions.push(eq(services.category, category));
    if (search) conditions.push(like(services.name, `%${search}%`));
    conditions.push(eq(services.isActive, true));

    const result = await db
      .select()
      .from(services)
      .where(and(...conditions))
      .orderBy(desc(services.createdAt));

    return result;
  });

  // GET /api/services/:id - Get single service
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await db.query.services.findFirst({
      where: eq(services.id, id),
    });

    if (!result) {
      reply.code(404).send({ error: 'Service not found' });
      return;
    }

    return result;
  });

  // POST /api/services - Create service
  fastify.post('/', async (request, reply) => {
    const data = request.body as NewService;
    
    const result = await db
      .insert(services)
      .values(data)
      .returning();

    reply.code(201).send(result[0]);
  });

  // PUT /api/services/:id - Update service
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<NewService>;

    const result = await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();

    if (!result[0]) {
      reply.code(404).send({ error: 'Service not found' });
      return;
    }

    return result[0];
  });

  // DELETE /api/services/:id - Soft delete service
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    await db
      .update(services)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(services.id, id));

    reply.code(204).send();
  });

  // GET /api/services/categories - Get all categories
  fastify.get('/meta/categories', async (request, reply) => {
    const { tenantId } = request.query as { tenantId?: string };
    
    const conditions = [eq(services.isActive, true)];
    if (tenantId) conditions.push(eq(services.tenantId, tenantId));

    const result = await db
      .selectDistinct({ category: services.category })
      .from(services)
      .where(and(...conditions));

    return result.map(r => r.category);
  });
}