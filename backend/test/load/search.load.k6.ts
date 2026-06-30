/**
 * k6-style search load test.
 *
 * Run with: k6 run test/load/search.load.k6.ts
 *
 * Simulates concurrent search requests with various filter combinations
 * and measures performance against defined thresholds.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const searchLatency = new Trend('search_latency_ms');
const errorRate = new Rate('search_error_rate');

export const options = {
  stages: [
    { duration: '20s', target: 30 },
    { duration: '1m', target: 80 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    search_latency_ms: ['p(95)<800', 'avg<300'],
    search_error_rate: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_PREFIX = 'api/v1';

function getAuthToken(): string {
  const loginRes = http.post(`${BASE_URL}/${API_PREFIX}/auth/login`, JSON.stringify({
    email: 'searchtest@example.com',
    password: 'SearchT3st!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    return loginRes.json('data.tokens.accessToken') as string;
  }
  return '';
}

const filterCombinations = [
  { gender: 'female', ageMin: 25, ageMax: 35 },
  { gender: 'male', religion: 'hindu', motherTongue: 'tamil' },
  { city: 'Bangalore', state: 'Karnataka' },
  { maritalStatus: 'never_married', ageMin: 25, ageMax: 30 },
  { technologyStack: 'React,Node.js', experienceMin: 2, experienceMax: 8 },
  { companyName: 'Google', hasPhotos: true },
  { country: 'India', salaryMin: 1000000, salaryMax: 3000000 },
  { educationLevel: 'B.Tech', onlineNow: true },
  { gender: 'female', ageMin: 28, ageMax: 38, religion: 'christian' },
  { workMode: 'remote', designation: 'Engineer', city: 'Mumbai' },
];

export default function () {
  group('Search Profile Flow', () => {
    const token = getAuthToken();
    if (!token) {
      errorRate.add(1);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const filters = filterCombinations[Math.floor(Math.random() * filterCombinations.length)];
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    queryParams.append('page', String(Math.floor(Math.random() * 5) + 1));
    queryParams.append('limit', '20');

    const searchStart = Date.now();
    const res = http.get(
      `${BASE_URL}/${API_PREFIX}/search/profiles?${queryParams.toString()}`,
      { headers },
    );
    const duration = Date.now() - searchStart;

    searchLatency.add(duration);

    const success = check(res, {
      'search successful': (r) => r.status === 200,
      'response time < 800ms': (r) => duration < 800,
    });

    if (!success) {
      errorRate.add(1);
    }
  });

  sleep(1);
}
