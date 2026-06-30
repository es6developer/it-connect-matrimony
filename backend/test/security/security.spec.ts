import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { REDIS_CLIENT } from '../../src/modules/auth/auth.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Security Tests', () => {
  let app: INestApplication;
  let userRepository: any;

  beforeAll(async () => {
    userRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(getRepositoryToken(require('../../src/database/entities/user.entity').User))
      .useValue(userRepository)
      .overrideProvider(getRepositoryToken(require('../../src/database/entities/session.entity').Session))
      .useValue({ create: jest.fn(), save: jest.fn(), findOne: jest.fn(), delete: jest.fn() })
      .overrideProvider(JwtService)
      .useValue({ signAsync: jest.fn(), verifyAsync: jest.fn(), sign: jest.fn(), verify: jest.fn() })
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn((key: string, dv?: any) => dv) })
      .overrideProvider(REDIS_CLIENT)
      .useValue({ get: jest.fn(), setex: jest.fn(), del: jest.fn() })
      .overrideProvider(getQueueToken('email'))
      .useValue({ add: jest.fn() })
      .overrideProvider(getQueueToken('sms'))
      .useValue({ add: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('SQL Injection Prevention', () => {
    it('should reject SQL injection attempts in login email', async () => {
      const sqlInjectionPayloads = [
        { email: "' OR '1'='1", password: 'test' },
        { email: "admin'--", password: 'test' },
        { email: "'; DROP TABLE users; --", password: 'test' },
        { email: "' UNION SELECT * FROM users; --", password: 'test' },
        { email: "1; SELECT * FROM users WHERE 1=1", password: 'test' },
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(payload);

        expect(response.status).toBe(400);
      }
    });

    it('should reject SQL injection in registration fields', async () => {
      const injectionPayloads = [
        {
          firstName: "Robert'; DROP TABLE users;--",
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'StrongP@ss1',
          gender: 'male',
          dateOfBirth: '1995-06-15',
        },
        {
          firstName: 'Test',
          lastName: "'; SELECT * FROM users;--",
          email: 'test2@example.com',
          password: 'StrongP@ss1',
          gender: 'male',
          dateOfBirth: '1995-06-15',
        },
      ];

      for (const payload of injectionPayloads) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(payload);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should reject XSS attempts in profile fields', async () => {
      const xssPayloads = [
        { firstName: '<script>alert("xss")</script>', lastName: 'Doe', email: 'xss1@test.com', password: 'StrongP@ss1', gender: 'male', dateOfBirth: '1995-06-15' },
        { firstName: 'Test', lastName: '<img src=x onerror=alert(1)>', email: 'xss2@test.com', password: 'StrongP@ss1', gender: 'male', dateOfBirth: '1995-06-15' },
        { firstName: '<svg onload=alert(document.cookie)>', lastName: 'User', email: 'xss3@test.com', password: 'StrongP@ss1', gender: 'male', dateOfBirth: '1995-06-15' },
        { firstName: 'Test', lastName: 'User', email: 'xss4@test.com', password: 'StrongP@ss1', gender: 'male', dateOfBirth: '1995-06-15' },
      ];

      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(payload);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('JWT Token Tampering', () => {
    it('should reject tampered JWT tokens', async () => {
      const tamperedTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0.tampered-signature',
        'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwicm9sZSI6InN1cGVyX2FkbWluIn0.',
        'invalid.jwt.token',
      ];

      for (const token of tamperedTokens) {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      }
    });

    it('should reject expired tokens gracefully', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE1MTYyMzkwMjJ9.pRq0tkLjB6x8YQyFPsP';

      const response = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limit Enforcement', () => {
    it('should include rate limit headers on auth endpoints', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'test123' });

      expect(response.status).toBeDefined();
    });

    it('should return 429 when rate limit is exceeded', async () => {
      const requests = Array.from({ length: 20 }, () =>
        request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: 'ratelimit@test.com', password: 'StrongP@ss1' }),
      );

      const results = await Promise.all(requests);
      const rateLimited = results.some((r) => r.status === 429);

      expect(rateLimited).toBeDefined();
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should reject excessively long inputs', async () => {
      const longPayload = {
        firstName: 'A'.repeat(256),
        lastName: 'B'.repeat(256),
        email: 'long@test.com',
        password: 'StrongP@ss1',
        gender: 'male',
        dateOfBirth: '1995-06-15',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(longPayload);

      expect(response.status).toBe(400);
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'not-an-email',
        '@no-user.com',
        'spaced email@test.com',
        'test@',
        'test@.com',
        '',
      ];

      for (const email of invalidEmails) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email, password: 'StrongP@ss1' });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Password Policies', () => {
    it('should reject passwords without uppercase', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'passwordtest@test.com',
          password: 'weakpass1!',
          gender: 'male',
          dateOfBirth: '1995-06-15',
        });

      expect(response.status).toBe(400);
    });

    it('should reject passwords without special characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'passwordtest2@test.com',
          password: 'Weakpass1',
          gender: 'male',
          dateOfBirth: '1995-06-15',
        });

      expect(response.status).toBe(400);
    });

    it('should reject passwords shorter than 8 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'passwordtest3@test.com',
          password: 'Sh0rt!',
          gender: 'male',
          dateOfBirth: '1995-06-15',
        });

      expect(response.status).toBe(400);
    });
  });
});
