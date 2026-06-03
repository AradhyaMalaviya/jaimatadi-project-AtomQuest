import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MOCK_USERS } from '../config/mockUsers';
import { generateTokens } from '../services/authService';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { env } from '../config/env';
import { prisma } from '../db/client';
import { Role } from '@prisma/client';

const msalConfig: Configuration = {
  auth: {
    clientId: env.AZURE_CLIENT_ID || 'placeholder-client-id',
    authority: `https://login.microsoftonline.com/${env.AZURE_TENANT_ID || 'placeholder-tenant-id'}`,
    clientSecret: env.AZURE_CLIENT_SECRET || 'placeholder-client-secret',
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

const getManagerDepth = (userId: string): number => {
  const user = MOCK_USERS.find((mockUser) => mockUser.id === userId);
  if (!user?.managerId) return 0;
  return 1 + getManagerDepth(user.managerId);
};

const ensureMockUsers = async () => {
  const orderedUsers = [...MOCK_USERS].sort((a, b) => getManagerDepth(a.id) - getManagerDepth(b.id));

  for (const user of orderedUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        role: user.role as Role,
        department: user.department,
        managerId: user.managerId,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role,
        department: user.department,
        managerId: user.managerId,
      },
    });
  }
};

export default async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Get available mock users (Keep for local dev fallback)
  fastify.get('/users', async () => {
    return { success: true, data: MOCK_USERS };
  });

  // MSAL SSO Login Initiation
  fastify.get('/login/sso', async (request, reply) => {
    const authCodeUrlParameters = {
      scopes: ['user.read'],
      redirectUri: env.AZURE_REDIRECT_URI || 'http://localhost:3001/api/auth/callback/sso',
    };

    try {
      const response = await cca.getAuthCodeUrl(authCodeUrlParameters);
      return reply.redirect(response);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Failed to initiate SSO login' });
    }
  });

  // MSAL SSO Callback
  fastify.get('/callback/sso', async (request, reply) => {
    const tokenRequest = {
      code: (request.query as any).code,
      scopes: ['user.read'],
      redirectUri: env.AZURE_REDIRECT_URI || 'http://localhost:3001/api/auth/callback/sso',
    };

    try {
      const response = await cca.acquireTokenByCode(tokenRequest);
      
      if (!response || !response.account || !response.account.username) {
        return reply.status(401).send({ success: false, message: 'SSO Login failed' });
      }

      const email = response.account.username;
      
      // Upsert user in the database
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: response.account.name || email.split('@')[0],
            email,
            role: Role.EMPLOYEE, // default role
          }
        });
      }

      const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role });

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      // Redirect back to frontend
      return reply.redirect(`${env.ALLOWED_ORIGINS.split(',')[0]}/login?token=${accessToken}`);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'SSO Authentication failed' });
    }
  });

  // Mock login (Fallback)
  fastify.post('/login', async (request, reply) => {
    const { userId } = request.body as { userId: string };
    await ensureMockUsers();

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return reply.status(401).send({ success: false, message: 'User not found' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      success: true,
      data: {
        user,
        accessToken,
      },
    };
  });

  // Logout
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('refreshToken', { path: '/' });
    return { success: true };
  });
}
