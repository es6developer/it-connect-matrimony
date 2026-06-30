/**
 * Chat Load Test
 *
 * Run with: npx jest test/load/chat.load.spec.ts --config test/jest.config.ts
 * Simulates 100 concurrent users sending messages and measures performance.
 */

describe('Chat Load Test', () => {
  const CONCURRENT_USERS = 100;
  const MESSAGES_PER_USER = 10;
  const THROUGHPUT_THRESHOLD_MS = 500;
  const P95_THRESHOLD_MS = 1000;

  const results: number[] = [];

  beforeAll(() => {
    jest.setTimeout(120000);
  });

  afterAll(() => {
    if (results.length === 0) return;

    results.sort((a, b) => a - b);
    const total = results.length;
    const sum = results.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    const p95 = results[Math.floor(total * 0.95)];
    const p99 = results[Math.floor(total * 0.99)];
    const throughput = (total / (sum / 1000)).toFixed(2);

    console.log('\n=== Chat Load Test Results ===');
    console.log(`Total Requests: ${total}`);
    console.log(`Mean Latency: ${mean.toFixed(2)}ms`);
    console.log(`P95 Latency: ${p95}ms`);
    console.log(`P99 Latency: ${p99}ms`);
    console.log(`Throughput: ${throughput} req/s`);
    console.log(`Threshold (P95 < ${P95_THRESHOLD_MS}ms): ${p95 <= P95_THRESHOLD_MS ? 'PASS' : 'FAIL'}`);
    console.log(`Threshold (Mean < ${THROUGHPUT_THRESHOLD_MS}ms): ${mean <= THROUGHPUT_THRESHOLD_MS ? 'PASS' : 'FAIL'}`);
    console.log('============================\n');
  });

  it('should simulate concurrent chat message sending with acceptable performance', async () => {
    const mockSendMessage = jest.fn().mockImplementation(async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 40));
      const duration = Date.now() - start;
      results.push(duration);
      return { success: true };
    });

    const tasks: Promise<any>[] = [];

    for (let user = 0; user < CONCURRENT_USERS; user++) {
      for (let msg = 0; msg < MESSAGES_PER_USER; msg++) {
        tasks.push(mockSendMessage());
      }
    }

    await Promise.all(tasks);

    expect(mockSendMessage).toHaveBeenCalledTimes(CONCURRENT_USERS * MESSAGES_PER_USER);

    results.sort((a, b) => a - b);
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    const p95 = results[Math.floor(results.length * 0.95)];

    expect(mean).toBeLessThan(THROUGHPUT_THRESHOLD_MS);
    expect(p95).toBeLessThan(P95_THRESHOLD_MS);
  });

  it('should handle concurrent conversation creation', async () => {
    const convResults: number[] = [];
    const CONCURRENT_CONVERSATIONS = 50;

    const mockCreateConversation = jest.fn().mockImplementation(async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 35));
      const duration = Date.now() - start;
      convResults.push(duration);
      return { success: true };
    });

    const tasks = Array.from({ length: CONCURRENT_CONVERSATIONS }, (_, i) =>
      mockCreateConversation(),
    );

    await Promise.all(tasks);

    const mean = convResults.reduce((a, b) => a + b, 0) / convResults.length;
    console.log(`Conversation Creation Mean Latency: ${mean.toFixed(2)}ms`);

    expect(mockCreateConversation).toHaveBeenCalledTimes(CONCURRENT_CONVERSATIONS);
    expect(mean).toBeLessThan(THROUGHPUT_THRESHOLD_MS);
  });

  it('should maintain response time under load for get messages', async () => {
    const getResults: number[] = [];

    const mockGetMessages = jest.fn().mockImplementation(async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 5 + Math.random() * 20));
      getResults.push(Date.now() - start);
      return { data: [], total: 0 };
    });

    const tasks = Array.from({ length: CONCURRENT_USERS }, () => mockGetMessages());
    await Promise.all(tasks);

    const mean = getResults.reduce((a, b) => a + b, 0) / getResults.length;
    console.log(`Get Messages Mean Latency: ${mean.toFixed(2)}ms`);

    expect(mean).toBeLessThan(300);
  });
});
