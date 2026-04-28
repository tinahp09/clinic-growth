import type { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { patients, tenants } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { sendVerificationSMS, sendWelcomeSMS } from '../../lib/sms.js';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function clientAuthRoutes(fastify: FastifyInstance) {
  const ACCESS_TOKEN_EXPIRY = '15m';
  const REFRESH_TOKEN_EXPIRY = '7d';

  function generateAccessToken(payload: any): string {
    return fastify.jwt.sign({ ...payload, type: 'access' }, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  function generateRefreshToken(payload: any): string {
    return fastify.jwt.sign({ ...payload, type: 'refresh' }, { expiresIn: REFRESH_TOKEN_EXPIRY });
  }

  function verifyRefreshToken(token: string): any {
    return fastify.jwt.verify(token);
  }

  // Store OTPs in memory (use Redis in production)
  const otpStore = new Map<string, { code: string; purpose: string; expiresAt: Date; used: boolean }>();

  // Clean expired OTPs
  setInterval(() => {
    const now = new Date();
    for (const [key, value] of otpStore.entries()) {
      if (value.expiresAt < now) otpStore.delete(key);
    }
  }, 60000);

  // POST /api/v1/auth/client/register/otp
  fastify.post('/client/register/otp', async (request, reply) => {
    const body = request.body as any;
    const { fullName, mobile } = body;

    if (!fullName || fullName.trim().length < 3) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: { fullName: ['Full name is required (min 3 characters)'] }
      });
    }

    if (!mobile || !/^09[0-9]{9}$/.test(mobile)) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: { mobile: ['Invalid mobile number format'] }
      });
    }

    // Check if mobile already registered
    const existingPatient = await db.query.patients.findFirst({
      where: eq(patients.mobile, mobile)
    });

    if (existingPatient) {
      return reply.code(409).send({
        status: 409,
        message: 'Mobile number already registered'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    otpStore.set(mobile, {
      code: otp,
      purpose: 'register',
      expiresAt,
      used: false
    });

    // Send SMS via Kavenegar
    await sendVerificationSMS(mobile, otp, 'register');

    // Include OTP in response for development
    const isDev = process.env.NODE_ENV === 'development';

    return reply.code(200).send({
      status: 200,
      message: 'OTP sent successfully',
      expiresIn: 300,
      ...(isDev && { debugOtp: otp })
    });
  });

  // POST /api/v1/auth/client/register/verify
  fastify.post('/client/register/verify', async (request, reply) => {
    const body = request.body as any;
    const { fullName, mobile, otp } = body;

    if (!fullName || fullName.trim().length < 3) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: { fullName: ['Full name is required'] }
      });
    }

    if (!mobile || !/^09[0-9]{9}$/.test(mobile)) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: { mobile: ['Invalid mobile number format'] }
      });
    }

    if (!otp || otp.length !== 6) {
      return reply.code(400).send({
        status: 400,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP
    const storedOtp = otpStore.get(mobile);
    if (!storedOtp || storedOtp.used || storedOtp.expiresAt < new Date()) {
      return reply.code(400).send({
        status: 400,
        message: 'Invalid or expired OTP'
      });
    }

    if (storedOtp.code !== otp || storedOtp.purpose !== 'register') {
      return reply.code(400).send({
        status: 400,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    storedOtp.used = true;

    // Get demo tenant
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, 'demo-clinic')
    });

    if (!tenant) {
      return reply.code(500).send({
        status: 500,
        message: 'No clinic configured'
      });
    }

    // Create patient
    const [patient] = await db.insert(patients).values({
      tenantId: tenant.id,
      name: fullName,
      mobile,
      isVerified: true
    }).returning();

    // Send welcome SMS
    await sendWelcomeSMS(mobile, fullName);

    // Generate tokens
    const payload = { id: patient.id, tenantId: patient.tenantId, type: 'patient' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return reply.code(201).send({
      status: 201,
      message: 'Registration successful',
      patient: {
        id: patient.id,
        fullName: patient.name,
        mobile: patient.mobile
      },
      accessToken,
      refreshToken
    });
  });

  // POST /api/v1/auth/client/login/otp
  fastify.post('/client/login/otp', async (request, reply) => {
    const body = request.body as any;
    const { mobile } = body;

    if (!mobile || !/^09[0-9]{9}$/.test(mobile)) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: { mobile: ['Invalid mobile number format'] }
      });
    }

    // Check if mobile registered
    const patient = await db.query.patients.findFirst({
      where: eq(patients.mobile, mobile)
    });

    if (!patient) {
      return reply.code(404).send({
        status: 404,
        message: 'Mobile number not registered'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    otpStore.set(mobile, {
      code: otp,
      purpose: 'login',
      expiresAt,
      used: false
    });

    // Send SMS via Kavenegar
    await sendVerificationSMS(mobile, otp, 'login');

    // Include OTP in response for development
    const isDev = process.env.NODE_ENV === 'development';

    return reply.code(200).send({
      status: 200,
      message: 'OTP sent successfully',
      expiresIn: 300,
      ...(isDev && { debugOtp: otp })
    });
  });

  // POST /api/v1/auth/client/login/verify
  fastify.post('/client/login/verify', async (request, reply) => {
    const body = request.body as any;
    const { mobile, otp } = body;

    if (!mobile || !/^09[0-9]{9}$/.test(mobile)) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation failed',
        errors: { mobile: ['Invalid mobile number format'] }
      });
    }

    if (!otp || otp.length !== 6) {
      return reply.code(400).send({
        status: 400,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP
    const storedOtp = otpStore.get(mobile);
    if (!storedOtp || storedOtp.used || storedOtp.expiresAt < new Date()) {
      return reply.code(400).send({
        status: 400,
        message: 'Invalid or expired OTP'
      });
    }

    if (storedOtp.code !== otp || storedOtp.purpose !== 'login') {
      return reply.code(400).send({
        status: 400,
        message: 'Invalid or expired OTP'
      });
    }

    // Find patient
    const patient = await db.query.patients.findFirst({
      where: and(
        eq(patients.mobile, mobile),
        eq(patients.isVerified, true)
      )
    });

    if (!patient) {
      return reply.code(404).send({
        status: 404,
        message: 'Mobile number not registered'
      });
    }

    // Mark OTP as used
    storedOtp.used = true;

    // Generate tokens
    const payload = { id: patient.id, tenantId: patient.tenantId, type: 'patient' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return reply.code(200).send({
      status: 200,
      message: 'Login successful',
      patient: {
        id: patient.id,
        fullName: patient.name,
        mobile: patient.mobile
      },
      accessToken,
      refreshToken
    });
  });

  // POST /api/v1/auth/client/refresh
  fastify.post('/client/refresh', async (request, reply) => {
    const body = request.body as any;
    const { refreshToken } = body;

    if (!refreshToken) {
      return reply.code(400).send({
        status: 400,
        message: 'Refresh token is required'
      });
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const patient = await db.query.patients.findFirst({
        where: eq(patients.id, decoded.id)
      });

      if (!patient) {
        return reply.code(401).send({
          status: 401,
          message: 'Invalid or expired refresh token'
        });
      }

      const newAccessToken = generateAccessToken({
        id: patient.id,
        tenantId: patient.tenantId,
        type: 'patient'
      });

      return reply.code(200).send({
        status: 200,
        accessToken: newAccessToken
      });
    } catch (err) {
      return reply.code(401).send({
        status: 401,
        message: 'Invalid or expired refresh token'
      });
    }
  });

  // POST /api/v1/auth/client/logout
  fastify.post('/client/logout', async (request, reply) => {
    return reply.code(200).send({
      status: 200,
      message: 'Logged out successfully'
    });
  });
}