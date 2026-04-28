import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { transactions, bookings, paymentStatusEnum, type NewTransaction } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { env } from '../../config/env.js';

interface ZarinPalRequest {
  merchant_id: string;
  amount: number;
  callback_url: string;
  description: string;
  mobile?: string;
  email?: string;
}

interface ZarinPalResponse {
  code: number;
  authority: string;
  fee_type?: string;
  fee?: number;
  message?: string;
}

export default async function paymentsRoutes(fastify: FastifyInstance) {
  // POST /api/payments/initiate - Start payment
  fastify.post('/initiate', async (request, reply) => {
    const { bookingId, amount, mobile } = request.body as {
      bookingId: string;
      amount: number;
      mobile?: string;
    };

    // Get booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      reply.code(404).send({ error: 'Booking not found' });
      return;
    }

    // In production, make actual ZarinPal API call
    // For now, simulate with mock authority
    const authority = `A${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
    
    // Create transaction record
    const [transaction] = await db
      .insert(transactions)
      .values({
        tenantId: booking.tenantId,
        bookingId: booking.id,
        amount,
        status: 'INITIATED',
        zarinpalAuthority: authority,
      })
      .returning();

    // Update booking status
    await db
      .update(bookings)
      .set({ 
        status: 'PENDING_PAYMENT',
        paymentStatus: 'INITIATED',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // In production: call ZarinPal API
    // const zarinpalUrl = env.ZARINPAL_SANDBOX 
    //   ? 'https://sandbox.zarinpal.com/pg/v4/payment/request.json'
    //   : 'https://.zarinpal.com/pg/v4/payment/request.json';

    // Return mock payment URL for now
    const paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;

    reply.send({
      authority,
      paymentUrl,
      transactionId: transaction.id,
      amount,
    });
  });

  // GET /api/payments/callback - ZarinPal callback (this is called by ZarinPal after payment)
  fastify.get('/callback', async (request, reply) => {
    const { Authority, Status } = request.query as { Authority: string; Status: string };

    // Find transaction
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.zarinpalAuthority, Authority as string),
    });

    if (!transaction) {
      reply.code(404).send({ error: 'Transaction not found' });
      return;
    }

    if (Status === 'OK') {
      // In production, verify with ZarinPal API
      // const verifyResponse = await fetch(zarinpalUrl, { method: 'POST', body: JSON.stringify({ ... }) });
      
      // Update transaction
      await db
        .update(transactions)
        .set({
          status: 'VERIFIED',
          zarinpalRef: `ZP-${Date.now()}`,
          verifiedAt: new Date(),
          gatewayResponse: { code: 100, message: 'OK' },
        })
        .where(eq(transactions.id, transaction.id));

      // Update booking
      if (transaction.bookingId) {
        await db
          .update(bookings)
          .set({
            status: 'CONFIRMED',
            paymentStatus: 'VERIFIED',
            paymentRef: `ZP-${Date.now()}`,
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, transaction.bookingId));
      }

      // Redirect to frontend success
      reply.redirect('/client/confirmation?status=success');
    } else {
      // Payment failed
      await db
        .update(transactions)
        .set({
          status: 'FAILED',
          gatewayResponse: { status: Status, message: 'Payment cancelled or failed' },
        })
        .where(eq(transactions.id, transaction.id));

      // Update booking
      if (transaction.bookingId) {
        await db
          .update(bookings)
          .set({
            status: 'FAILED_PAYMENT',
            paymentStatus: 'FAILED',
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, transaction.bookingId));
      }

      reply.redirect('/client/payment?status=failed');
    }
  });

  // POST /api/payments/verify - Verify payment (server-to-server)
  fastify.post('/verify', async (request, reply) => {
    const { authority } = request.body as { authority: string };

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.zarinpalAuthority, authority),
    });

    if (!transaction) {
      reply.code(404).send({ error: 'Transaction not found' });
      return;
    }

    // In production, call ZarinPal verify API
    // For now, mark as verified
    await db
      .update(transactions)
      .set({
        status: 'VERIFIED',
        zarinpalRef: `ZP-${Date.now()}`,
        verifiedAt: new Date(),
      })
      .where(eq(transactions.id, transaction.id));

    if (transaction.bookingId) {
      await db
        .update(bookings)
        .set({
          status: 'CONFIRMED',
          paymentStatus: 'VERIFIED',
          paymentRef: `ZP-${Date.now()}`,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, transaction.bookingId));
    }

    return { success: true, message: 'Payment verified' };
  });

  // POST /api/payments/refund - Process refund
  fastify.post('/refund', async (request, reply) => {
    const { transactionId, reason } = request.body as {
      transactionId: string;
      reason: string;
    };

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId),
    });

    if (!transaction) {
      reply.code(404).send({ error: 'Transaction not found' });
      return;
    }

    if (transaction.status !== 'VERIFIED') {
      reply.code(400).send({ error: 'Can only refund verified transactions' });
      return;
    }

    // In production, call ZarinPal refund API
    // For now, mark as refunded
    await db
      .update(transactions)
      .set({
        status: 'REFUNDED',
        gatewayResponse: { reason, refundedAt: new Date().toISOString() },
      })
      .where(eq(transactions.id, transactionId));

    if (transaction.bookingId) {
      await db
        .update(bookings)
        .set({
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED',
          cancelReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, transaction.bookingId));
    }

    return { success: true, message: 'Refund processed' };
  });

  // GET /api/payments/booking/:bookingId - Get payment status for booking
  fastify.get('/booking/:bookingId', async (request, reply) => {
    const { bookingId } = request.params as { bookingId: string };

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      reply.code(404).send({ error: 'Booking not found' });
      return;
    }

    const transaction = booking.id 
      ? await db.query.transactions.findFirst({
          where: and(
            eq(transactions.tenantId, booking.tenantId),
            eq(transactions.bookingId, booking.id)
          ),
        })
      : null;

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.paymentStatus,
      amount: booking.totalAmount,
      transactionId: transaction?.id,
      zarinpalRef: transaction?.zarinpalRef,
    };
  });
}