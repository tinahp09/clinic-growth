import type { FastifyInstance } from 'fastify';

export interface TokenPayload {
  id: string;
  tenantId: string;
  username: string;
  role: string;
  type: 'access' | 'refresh';
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(fastify: FastifyInstance, payload: Omit<TokenPayload, 'type'>): string {
  return fastify.jwt.sign({ ...payload, type: 'access' }, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(fastify: FastifyInstance, payload: Omit<TokenPayload, 'type'>): string {
  return fastify.jwt.sign({ ...payload, type: 'refresh' }, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(fastify: FastifyInstance, token: string): TokenPayload {
  return fastify.jwt.verify<TokenPayload>(token);
}

export function verifyRefreshToken(fastify: FastifyInstance, token: string): TokenPayload {
  return fastify.jwt.verify<TokenPayload>(token);
}