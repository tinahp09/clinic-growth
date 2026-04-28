import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { users, tenants, type User } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema, refreshSchema, formatZodErrors } from './dto.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, type TokenPayload } from '../../lib/tokens.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/v1/auth/register
  fastify.post('/register', async (request, reply) => {
    const body = request.body as unknown;
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      });
    }

    const { clinicName, username, password } = parsed.data;

    // Check if username already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUser) {
      return reply.code(409).send({
        status: 409,
        message: 'Username already exists',
      });
    }

    // Create tenant (clinic)
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: clinicName,
        slug: username.toLowerCase(),
      })
      .returning();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        username,
        name: username,
        passwordHash,
        role: 'OWNER',
        isActive: true,
      })
      .returning();

    return reply.code(201).send({
      status: 201,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        clinicId: tenant.id,
        clinicName: tenant.name,
        username: newUser.username,
        role: newUser.role,
      },
    });
  });

  // POST /api/v1/auth/login
  fastify.post('/login', async (request, reply) => {
    const body = request.body as unknown;
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      });
    }

    const { username, password } = parsed.data;

    // Find user by username
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.username, username.toLowerCase()),
      ),
    });

    if (!user) {
      return reply.code(401).send({
        status: 401,
        message: 'Invalid username or password',
      });
    }

    // Get tenant info
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, user.tenantId),
    });

    // Check password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return reply.code(401).send({
        status: 401,
        message: 'Invalid username or password',
      });
    }

    // Check if active
    if (!user.isActive) {
      return reply.code(403).send({
        status: 403,
        message: 'Account is inactive',
      });
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      tenantId: user.tenantId,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(fastify, tokenPayload);
    const refreshToken = generateRefreshToken(fastify, tokenPayload);

    return reply.code(200).send({
      status: 200,
      message: 'Login successful',
      user: {
        id: user.id,
        clinicId: user.tenantId,
        clinicName: tenant?.name || '',
        username: user.username,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  });

  // POST /api/v1/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const body = request.body as unknown;
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      });
    }

    const { refreshToken } = parsed.data;

    try {
      const decoded = verifyRefreshToken(fastify, refreshToken);

      // Find user to ensure still active
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.id),
      });

      if (!user || !user.isActive) {
        return reply.code(401).send({
          status: 401,
          message: 'Invalid or expired refresh token',
        });
      }

      const tokenPayload = {
        id: user.id,
        tenantId: user.tenantId,
        username: user.username,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(fastify, tokenPayload);

      return reply.code(200).send({
        status: 200,
        accessToken: newAccessToken,
      });
    } catch (err) {
      return reply.code(401).send({
        status: 401,
        message: 'Invalid or expired refresh token',
      });
    }
  });

  // POST /api/v1/auth/logout
  fastify.post('/logout', async (request, reply) => {
    return reply.code(200).send({
      status: 200,
      message: 'Logged out successfully',
    });
  });
}