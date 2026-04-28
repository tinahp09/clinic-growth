import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { media, type NewMedia } from '../../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';

export default async function mediaRoutes(fastify: FastifyInstance) {
  // GET /api/media - List media items
  fastify.get('/', async (request, reply) => {
    const { 
      tenantId, 
      bookingId, 
      patientId, 
      type,
      visibleToClient,
      page = '1',
      limit = '20'
    } = request.query as { 
      tenantId?: string; 
      bookingId?: string;
      patientId?: string;
      type?: string;
      visibleToClient?: string;
      page?: string;
      limit?: string;
    };

    const conditions = [];
    if (tenantId) conditions.push(eq(media.tenantId, tenantId));
    if (bookingId) conditions.push(eq(media.bookingId, bookingId));
    if (patientId) conditions.push(eq(media.patientId, patientId));
    if (type) conditions.push(eq(media.type, type as any));
    if (visibleToClient === 'true') conditions.push(eq(media.visibleToClient, true));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const result = await db
      .select()
      .from(media)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(media.createdAt))
      .limit(limitNum)
      .offset(offset);

    return result;
  });

  // GET /api/media/:id - Get single media item
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await db.query.media.findFirst({
      where: eq(media.id, id),
    });

    if (!result) {
      reply.code(404).send({ error: 'Media not found' });
      return;
    }

    return result;
  });

  // POST /api/media - Upload/create media (simplified - no actual file upload)
  fastify.post('/', async (request, reply) => {
    const data = request.body as NewMedia;

    const [result] = await db
      .insert(media)
      .values(data)
      .returning();

    reply.code(201).send(result);
  });

  // PUT /api/media/:id - Update media (consent, visibility)
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<NewMedia>;

    // If setting public consent, add timestamp
    if (data.publicConsentGiven && !data.publicConsentAt) {
      data.publicConsentAt = new Date();
    }

    const result = await db
      .update(media)
      .set(data)
      .where(eq(media.id, id))
      .returning();

    if (!result[0]) {
      reply.code(404).send({ error: 'Media not found' });
      return;
    }

    return result[0];
  });

  // DELETE /api/media/:id - Delete media
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    await db.delete(media).where(eq(media.id, id));

    reply.code(204).send();
  });

  // GET /api/media/patient/:patientId - Get patient's media gallery
  fastify.get('/patient/:patientId', async (request, reply) => {
    const { patientId } = request.params as { patientId: string };

    const result = await db
      .select()
      .from(media)
      .where(and(
        eq(media.patientId, patientId),
        eq(media.visibleToClient, true)
      ))
      .orderBy(desc(media.createdAt));

    // Group by booking
    const grouped: Record<string, typeof result> = {};
    result.forEach(item => {
      const key = item.bookingId || 'unlinked';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return grouped;
  });
}