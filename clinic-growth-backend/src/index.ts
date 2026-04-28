import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { env } from './config/env.js';
import { db } from './db/index.js';
import { tenants } from './db/schema.js';
import { eq } from 'drizzle-orm';

// Routes
import servicesRoutes from './modules/services/routes.js';
import staffRoutes from './modules/staff/routes.js';
import roomsRoutes from './modules/rooms/routes.js';
import bookingsRoutes from './modules/bookings/routes.js';
import paymentsRoutes from './modules/payments/routes.js';
import authRoutes from './modules/auth/routes.js';
import clientAuthRoutes from './modules/auth/client-routes.js';
import mediaRoutes from './modules/media/routes.js';

const fastify = Fastify({
  logger: true,
});

async function start() {
  // Plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(cookie);

  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
    sign: {
      expiresIn: '15m',
    },
  });

  // Register refresh jwt
  fastify.register(async function (fastify) {
    fastify.addContentTypeParser('application/json', function (req, body, done) {
      return done(null, body);
    });
  }, {
    prefix: '/refresh-jwt',
  });

  // Decorate with db
  fastify.decorate('db', db);

  // Auth hook
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh', '/api/payments/callback', '/health'];
      const isPublic = publicPaths.some((path) => request.url.startsWith(path));
      
      if (isPublic) return;
      
      // Skip auth for now during development
      // const token = request.cookies.token || request.headers.authorization?.replace('Bearer ', '');
      // if (token) {
      //   request.user = fastify.jwt.verify(token);
      // }
    } catch (err) {
      // Continue without auth for now
    }
  });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Routes
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(clientAuthRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(servicesRoutes, { prefix: '/api/services' });
  await fastify.register(staffRoutes, { prefix: '/api/staff' });
  await fastify.register(roomsRoutes, { prefix: '/api/rooms' });
  await fastify.register(bookingsRoutes, { prefix: '/api/bookings' });
  await fastify.register(paymentsRoutes, { prefix: '/api/payments' });
  await fastify.register(mediaRoutes, { prefix: '/api/media' });

  // Seed demo tenant
  try {
    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, 'demo-clinic'),
    });

    if (!existingTenant) {
      await db.insert(tenants).values({
        name: 'کلینیک زیبایی آرام',
        slug: 'demo-clinic',
        phone: '021-88776655',
        address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۳',
        zarinpalMerchantId: 'demo-merchant-id',
        settings: {},
      });
      console.log('✅ Demo tenant created');
    }
  } catch (err) {
    console.error('Error seeding tenant:', err);
  }

  // Start server
  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();