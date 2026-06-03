import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';
import { generateTokens } from '../../src/services/authService';
import { prisma } from '../../src/db/client';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  
  // Set up test user
  await prisma.user.upsert({
    where: { id: 'test-employee' },
    update: {},
    create: {
      id: 'test-employee',
      name: 'Test Employee',
      email: 'employee@test.com',
      role: 'EMPLOYEE',
      department: 'Engineering'
    }
  });

  await prisma.user.upsert({
    where: { id: 'test-manager' },
    update: {},
    create: {
      id: 'test-manager',
      name: 'Test Manager',
      email: 'manager@test.com',
      role: 'MANAGER',
      department: 'Engineering'
    }
  });

  // Assign manager
  await prisma.user.update({
    where: { id: 'test-employee' },
    data: { managerId: 'test-manager' }
  });
});

afterAll(async () => {
  await prisma.goalSheet.deleteMany({ where: { employeeId: 'test-employee' } });
  await app.close();
});

describe('Security and Role-Based Access Control', () => {
  it('should block unauthenticated requests', async () => {
    const response = await supertest(app.server).get('/api/users/me');
    expect(response.status).toBe(401);
  });

  it('should block employee from accessing admin routes', async () => {
    const { accessToken } = generateTokens({ id: 'test-employee', role: 'EMPLOYEE' });
    const response = await supertest(app.server)
      .get('/api/reports/stats')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Requires role/);
  });

  it('should allow admin to access admin routes', async () => {
    const { accessToken } = generateTokens({ id: 'test-admin', role: 'ADMIN' });
    const response = await supertest(app.server)
      .get('/api/reports/stats')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('GoalSheet API Integration', () => {
  it('should allow employee to create draft', async () => {
    const { accessToken } = generateTokens({ id: 'test-employee', role: 'EMPLOYEE' });

    const response = await supertest(app.server)
      .post('/api/goal-sheets/draft/2024')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goals: [
          {
            title: 'Valid Goal 1',
            thrustArea: 'Revenue Growth',
            uom: 'NUMERIC',
            target: '100',
            weightage: 50
          },
          {
            title: 'Valid Goal 2',
            thrustArea: 'Operational Efficiency',
            uom: 'PERCENTAGE',
            target: '100',
            weightage: 50
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.data.goals.length).toBe(2);
  });

  it('should prevent submitting goal sheet with invalid total weightage', async () => {
    const { accessToken } = generateTokens({ id: 'test-employee', role: 'EMPLOYEE' });
    const response = await supertest(app.server)
      .post('/api/goal-sheets/submit/2024')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
      
    // Because draft in previous step has valid weightage, wait, submitting an existing draft just validates it.
    // If we wanted to test invalid weightage, we would first create a draft with <100 total, which is allowed for draft.
    // Let's create a draft with <100 total
    await supertest(app.server)
      .post('/api/goal-sheets/draft/2024')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goals: [
          {
            title: 'Valid Goal 1',
            thrustArea: 'Revenue Growth',
            uom: 'NUMERIC',
            target: '100',
            weightage: 50
          }
        ]
      });

    const submitResponse = await supertest(app.server)
      .post('/api/goal-sheets/submit/2024')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(submitResponse.status).toBe(400);
    expect(submitResponse.body.message).toBe('Validation failed');
  });
});
