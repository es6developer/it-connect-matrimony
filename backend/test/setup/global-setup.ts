export default async function globalSetup(): Promise<void> {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing-only';
  process.env.JWT_EXPIRY = '15m';
  process.env.JWT_REFRESH_EXPIRY = '7d';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.DATABASE_HOST = 'localhost';
  process.env.DATABASE_PORT = '3306';
  process.env.DATABASE_USERNAME = 'test';
  process.env.DATABASE_PASSWORD = 'test';
  process.env.DATABASE_DATABASE = 'it_connect_matrimony_test';
  process.env.AWS_REGION = 'us-east-1';
  process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
  process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
  process.env.S3_BUCKET = 'test-bucket';
}
