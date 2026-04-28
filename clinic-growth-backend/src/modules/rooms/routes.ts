import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { rooms, type NewRoom } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function roomsRoutes(fastify: FastifyInstance) {
  // GET /api/rooms - List all rooms
  fastify.get('/', async (request, reply) => {
    const { tenantId } = request.query as { tenantId?: string };
    
    let result = await db.select().from(rooms);
    if (tenantId) {
      result = result.filter(r => r.tenantId === tenantId);
    }

    return result;
  });

  // GET /api/rooms/:id - Get single room
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await db.query.rooms.findFirst({
      where: eq(rooms.id, id),
    });

    if (!result) {
      reply.code(404).send({ error: 'Room not found' });
      return;
    }

    return result;
  });

  // POST /api/rooms - Create room
  fastify.post('/', async (request, reply) => {
    const data = request.body as NewRoom;
    
    const result = await db
      .insert(rooms)
      .values(data)
      .returning();

    reply.code(201).send(result[0]);
  });

  // PUT /api/rooms/:id - Update room
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<NewRoom>;

    const result = await db
      .update(rooms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();

    if (!result[0]) {
      reply.code(404).send({ error: 'Room not found' });
      return;
    }

    return result[0];
  });

  // DELETE /api/rooms/:id - Delete room
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    await db.delete(rooms).where(eq(rooms.id, id));

    reply.code(204).send();
  });
}