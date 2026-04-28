import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { staff, type NewStaff, StaffLeave, staffLeaves } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export default async function staffRoutes(fastify: FastifyInstance) {
  // GET /api/staff - List all staff
  fastify.get('/', async (request, reply) => {
    const { tenantId, role } = request.query as { tenantId?: string; role?: string };
    
    const conditions = [eq(staff.isActive, true)];
    if (tenantId) conditions.push(eq(staff.tenantId, tenantId));
    if (role) conditions.push(eq(staff.role, role as any));

    const result = await db
      .select()
      .from(staff)
      .where(and(...conditions))
      .orderBy(staff.name);

    return result;
  });

  // GET /api/staff/:id - Get single staff member
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await db.query.staff.findFirst({
      where: eq(staff.id, id),
    });

    if (!result) {
      reply.code(404).send({ error: 'Staff not found' });
      return;
    }

    return result;
  });

  // POST /api/staff - Create staff member
  fastify.post('/', async (request, reply) => {
    const data = request.body as NewStaff;
    
    const result = await db
      .insert(staff)
      .values(data)
      .returning();

    reply.code(201).send(result[0]);
  });

  // PUT /api/staff/:id - Update staff member
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<NewStaff>;

    const result = await db
      .update(staff)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();

    if (!result[0]) {
      reply.code(404).send({ error: 'Staff not found' });
      return;
    }

    return result[0];
  });

  // DELETE /api/staff/:id - Soft delete
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    await db
      .update(staff)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(staff.id, id));

    reply.code(204).send();
  });

  // GET /api/staff/:id/availability - Get staff availability
  fastify.get('/:id/availability', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { date } = request.query as { date?: string };

    const staffMember = await db.query.staff.findFirst({
      where: eq(staff.id, id),
    });

    if (!staffMember) {
      reply.code(404).send({ error: 'Staff not found' });
      return;
    }

    // Return schedule info for now
    return {
      availableDays: staffMember.availableDays,
      workStart: staffMember.workStart,
      workEnd: staffMember.workEnd,
    };
  });

  // POST /api/staff/:id/leave - Request leave
  fastify.post('/:id/leave', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Omit<StaffLeave, 'id' | 'requestedAt'>;

    const result = await db
      .insert(staffLeaves)
      .values({
        ...data,
        staffId: id,
        requestedAt: new Date(),
      })
      .returning();

    reply.code(201).send(result[0]);
  });

  // GET /api/staff/:id/leaves - Get staff leaves
  fastify.get('/:id/leaves', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await db
      .select()
      .from(staffLeaves)
      .where(eq(staffLeaves.staffId, id))
      .orderBy(desc(staffLeaves.startDate));

    return result;
  });
}