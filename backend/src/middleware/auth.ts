import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../services/authService';

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ success: false, message: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !roles.includes(user.role)) {
      return reply.status(403).send({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
  };
};
