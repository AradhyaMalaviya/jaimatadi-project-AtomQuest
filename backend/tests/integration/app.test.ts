import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';
import { generateTokens } from '../../src/services/authService';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Health Routes', () => {
  it('GET /health should return status ok', async () => {
    const response = await supertest(app.server).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GoalSheet Validation', () => {
  it('POST /api/goal-sheets/draft/:cycle should validate min weightage', async () => {
    // Generate valid admin token to bypass auth middleware
    const { accessToken } = generateTokens({ id: 'test-admin', role: 'ADMIN' });
    
    const response = await supertest(app.server)
      .post('/api/goal-sheets/draft/2024')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goals: [
          {
            title: 'Bad Goal',
            thrustArea: 'Sales',
            uom: 'NUMERIC',
            target: '100',
            weightage: 5 // Too low, should trigger validation error
          }
        ]
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors.goals[0].weightage._errors).toContain('Minimum 10% weightage per goal required');
  });
});
