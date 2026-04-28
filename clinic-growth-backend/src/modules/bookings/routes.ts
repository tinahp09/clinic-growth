import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { 
  bookings, 
  bookingServices, 
  staff, 
  rooms, 
  services,
  patients,
  type NewBooking 
} from '../../db/schema.js';
import { eq, and, gte, lte, asc, sql, or, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export default async function bookingsRoutes(fastify: FastifyInstance) {
  // GET /api/bookings - List bookings
  fastify.get('/', async (request, reply) => {
    const { 
      tenantId, 
      status, 
      staffId, 
      dateFrom, 
      dateTo,
      page = '1',
      limit = '20'
    } = request.query as { 
      tenantId?: string; 
      status?: string; 
      staffId?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: string;
      limit?: string;
    };

    const conditions = [];
    if (tenantId) conditions.push(eq(bookings.tenantId, tenantId));
    if (status) conditions.push(eq(bookings.status, status as any));
    if (staffId) conditions.push(eq(bookings.staffId, staffId));
    if (dateFrom) conditions.push(gte(bookings.dateTime, new Date(dateFrom)));
    if (dateTo) conditions.push(lte(bookings.dateTime, new Date(dateTo)));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const result = await db
      .select()
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(bookings.dateTime))
      .limit(limitNum)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      data: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].count,
      }
    };
  });

  // GET /api/bookings/:id - Get single booking
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        bookingServices: {
          with: {
            service: true
          }
        }
      }
    });

    if (!result) {
      reply.code(404).send({ error: 'Booking not found' });
      return;
    }

    return result;
  });

  // POST /api/bookings - Create booking
  fastify.post('/', async (request, reply) => {
    const data = request.body as {
      tenantId: string;
      patientName: string;
      patientPhone: string;
      serviceIds: string[];
      staffId: string;
      dateTime: string;
      notes?: string;
    };

    // Generate booking number
    const bookingNumber = `CGP-${Date.now()}`;

    // Get services to calculate total and duration
    const serviceList = await db
      .select()
      .from(services)
      .where(or(...data.serviceIds.map(id => eq(services.id, id))));

    const totalAmount = serviceList.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = serviceList.reduce((sum, s) => sum + s.duration, 0);

    // Find or create patient
    let patientId: string;
    const existingPatient = await db.query.patients.findFirst({
      where: and(
        eq(patients.mobile, data.patientPhone),
        eq(patients.tenantId, data.tenantId)
      ),
    });

    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      const newPatient = await db
        .insert(patients)
        .values({
          tenantId: data.tenantId,
          name: data.patientName,
          mobile: data.patientPhone,
          isVerified: false,
        })
        .returning();
      patientId = newPatient[0].id;
    }

    // Auto-assign room if required
    let roomId: string | null = null;
    const requiresLaser = serviceList.some(s => s.requiresRoom === 'LASER');
    if (requiresLaser) {
      const availableRoom = await db.query.rooms.findFirst({
        where: and(
          eq(rooms.tenantId, data.tenantId),
          eq(rooms.type, 'LASER'),
          eq(rooms.status, 'AVAILABLE')
        ),
      });
      if (availableRoom) roomId = availableRoom.id;
    }

    // Create booking
    const bookingData: NewBooking = {
      tenantId: data.tenantId,
      bookingNumber,
      patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      staffId: data.staffId,
      roomId,
      dateTime: new Date(data.dateTime),
      status: 'RESERVED',
      totalAmount,
      notes: data.notes,
      reservedUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 min reservation
    };

    const [booking] = await db.insert(bookings).values(bookingData).returning();

    // Add services
    for (const serviceId of data.serviceIds) {
      await db.insert(bookingServices).values({
        bookingId: booking.id,
        serviceId,
      });
    }

    // Get full booking with services
    const fullBooking = await db.query.bookings.findFirst({
      where: eq(bookings.id, booking.id),
      with: {
        bookingServices: {
          with: { service: true }
        }
      }
    });

    reply.code(201).send(fullBooking);
  });

  // PUT /api/bookings/:id - Update booking
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<NewBooking>;

    const result = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    if (!result[0]) {
      reply.code(404).send({ error: 'Booking not found' });
      return;
    }

    return result[0];
  });

  // POST /api/bookings/:id/cancel - Cancel booking
  fastify.post('/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { reason } = request.body as { reason?: string };

    const result = await db
      .update(bookings)
      .set({ 
        status: 'CANCELLED', 
        cancelReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(bookings.id, id))
      .returning();

    if (!result[0]) {
      reply.code(404).send({ error: 'Booking not found' });
      return;
    }

    return result[0];
  });

  // GET /api/availability - Get available time slots
  fastify.get('/availability/slots', async (request, reply) => {
    const { tenantId, date, staffId } = request.query as { 
      tenantId: string; 
      date: string; 
      staffId?: string;
    };

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    
    // Get staff who work on this day
    let staffList = await db.select().from(staff).where(eq(staff.tenantId, tenantId));
    if (staffId) staffList = staffList.filter(s => s.id === staffId);
    
    const workingStaff = staffList.filter(s => 
      s.availableDays && s.availableDays.includes((dayOfWeek + 1) % 7) // Convert to Saturday=0
    );

    if (workingStaff.length === 0) {
      return { slots: [], message: 'No staff available on this day' };
    }

    // Get existing bookings for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.tenantId, tenantId),
        gte(bookings.dateTime, startOfDay),
        lte(bookings.dateTime, endOfDay),
        sql`${bookings.status} IN ('RESERVED', 'CONFIRMED', 'PENDING_PAYMENT')`
      ));

    // Generate time slots (9:00 - 18:00, 30 min intervals)
    const slots: Array<{
      time: string;
      available: boolean;
      staff: Array<{ id: string; name: string }>;
    }> = [];

    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    
    for (const hour of hours) {
      for (const minute of [0, 30]) {
        const slotTime = new Date(targetDate);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Check if slot is in the past
        const isPast = slotTime < new Date();
        
        // Check staff availability at this time
        const availableStaffAtSlot = workingStaff.filter(s => {
          const start = s.workStart || '09:00';
          const end = s.workEnd || '17:00';
          const [startH, startM] = start.split(':').map(Number);
          const [endH, endM] = end.split(':').map(Number);
          const slotMinutes = hour * 60 + minute;
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          
          return slotMinutes >= startMinutes && slotMinutes < endMinutes && !isPast;
        });

        // Check if any staff is booked at this time
        const isBooked = existingBookings.some(b => {
          const bTime = new Date(b.dateTime);
          return bTime.getHours() === hour && bTime.getMinutes() === minute;
        });

        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: availableStaffAtSlot.length > 0 && !isBooked,
          staff: availableStaffAtSlot.map(s => ({ id: s.id, name: s.name })),
        });
      }
    }

    return { slots, date: targetDate.toISOString() };
  });
}