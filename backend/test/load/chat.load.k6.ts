/**
 * k6-style chat load test.
 *
 * Run with: k6 run test/load/chat.load.k6.ts
 *
 * Simulates 100 concurrent WebSocket users sending messages
 * and measures response times and throughput.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const messageLatency = new Trend('message_latency_ms');
const messageThroughput = new Counter('messages_sent');
const errorRate = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    message_latency_ms: ['p(95)<1000', 'avg<300'],
    error_rate: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_PREFIX = 'api/v1';

function getAuthToken(): string {
  const loginRes = http.post(`${BASE_URL}/${API_PREFIX}/auth/login`, JSON.stringify({
    email: 'loadtest@example.com',
    password: 'LoadTestP@ss1',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, { 'login successful': (r) => r.status === 200 });

  if (loginRes.status === 200) {
    return loginRes.json('data.tokens.accessToken') as string;
  }
  return '';
}

export default function () {
  group('Chat Message Flow', () => {
    const token = getAuthToken();
    if (!token) {
      errorRate.add(1);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const conversationsRes = http.get(
      `${BASE_URL}/${API_PREFIX}/chat/conversations?page=1&limit=10`,
      { headers },
    );

    check(conversationsRes, { 'conversations fetched': (r) => r.status === 200 });

    let convId: string | null = null;
    if (conversationsRes.status === 200) {
      const body = conversationsRes.json() as any;
      if (body?.data?.length > 0) {
        convId = body.data[0].id;
      }
    }

    if (convId) {
      const messagePayload = JSON.stringify({
        conversationId: convId,
        content: `Load test message at ${Date.now()}`,
        type: 'text',
      });

      const msgStart = Date.now();
      const msgRes = http.post(
        `${BASE_URL}/${API_PREFIX}/chat/messages`,
        messagePayload,
        { headers },
      );
      const msgDuration = Date.now() - msgStart;

      messageLatency.add(msgDuration);
      messageThroughput.add(1);

      const msgSuccess = check(msgRes, {
        'message sent': (r) => r.status === 201 || r.status === 200,
        'response time < 1s': (r) => msgDuration < 1000,
      });

      if (!msgSuccess) {
        errorRate.add(1);
      }
    } else {
      const newConvRes = http.post(
        `${BASE_URL}/${API_PREFIX}/chat/conversations`,
        JSON.stringify({
          participantId: 'another-user-uuid',
          initialMessage: `Load test message at ${Date.now()}`,
        }),
        { headers },
      );

      check(newConvRes, { 'conversation created': (r) => r.status === 201 || r.status === 200 });
    }

    const messagesRes = http.get(
      `${BASE_URL}/${API_PREFIX}/chat/conversations/${convId || ''}/messages?page=1&limit=50`,
      { headers },
    );

    check(messagesRes, { 'messages fetched': (r) => r.status === 200 });
  });

  sleep(1);
}
