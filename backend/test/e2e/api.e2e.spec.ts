import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('ThrottlerModule')
      .useValue({})
      .overrideProvider('ElasticsearchModule')
      .useValue({})
      .overrideProvider('BullModule')
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /api/v1/health should return 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('GET / should return 200', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(400);
        });
    });
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/v1/auth/register should validate input', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);
    });

    it('POST /api/v1/auth/register should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'weak',
          gender: 'male',
          dateOfBirth: '1995-06-15',
        })
        .expect(400);
    });

    it('POST /api/v1/auth/login should validate input', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('POST /api/v1/auth/forgot-password should validate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('Protected Endpoints', () => {
    it('GET /api/v1/users/me should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('GET /api/v1/profiles/me should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/profiles/me')
        .expect(401);
    });

    it('GET /api/v1/chat/conversations should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/chat/conversations')
        .expect(401);
    });

    it('POST /api/v1/interest/send should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/interests/send')
        .send({ toUserId: 2 })
        .expect(401);
    });

    it('POST /api/v1/payments/create-order should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/create-order')
        .send({ amount: 1000, currency: 'INR' })
        .expect(401);
    });

    it('GET /api/v1/matches should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .expect(401);
    });
  });

  describe('Invalid Token Handling', () => {
    it('should return 401 with malformed JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer malformed-token')
        .expect(401);
    });

    it('should return 401 with expired JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.hVj4tPIaBmM7TzGxHx0PIQ5X0')
        .expect(401);
    });
  });

  describe('Public Endpoints', () => {
    it('GET /api/v1/profiles/public/:id should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/profiles/public/invalid')
        .expect(400);
    });
  });

  describe('Input Validation', () => {
    it('POST /api/v1/auth/register should reject missing required fields', async () => {
      const testCases = [
        { firstName: 'Test' },
        { email: 'test@example.com' },
        { password: 'StrongP@ss1' },
        {},
      ];

      for (const body of testCases) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(body)
          .expect(400);
      }
    });

    it('POST /api/v1/auth/login should reject missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'StrongP@ss1' })
        .expect(400);
    });
  });
});
