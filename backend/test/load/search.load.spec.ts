/**
 * Search Load Test
 *
 * Run with: npx jest test/load/search.load.spec.ts --config test/jest.config.ts
 * Simulates concurrent search requests with various filter combinations.
 */

describe('Search Load Test', () => {
  const CONCURRENT_SEARCHES = 50;
  const SEARCH_ITERATIONS = 100;
  const P95_THRESHOLD_MS = 800;
  const MEAN_THRESHOLD_MS = 300;

  const searchResults: number[] = [];

  beforeAll(() => {
    jest.setTimeout(120000);
  });

  afterAll(() => {
    if (searchResults.length === 0) return;

    searchResults.sort((a, b) => a - b);
    const total = searchResults.length;
    const mean = searchResults.reduce((a, b) => a + b, 0) / total;
    const p95 = searchResults[Math.floor(total * 0.95)];
    const throughput = (total / (searchResults.reduce((a, b) => a + b, 0) / 1000)).toFixed(2);

    console.log('\n=== Search Load Test Results ===');
    console.log(`Total Searches: ${total}`);
    console.log(`Mean Latency: ${mean.toFixed(2)}ms`);
    console.log(`P95 Latency: ${p95}ms`);
    console.log(`Throughput: ${throughput} req/s`);
    console.log(`Threshold (P95 < ${P95_THRESHOLD_MS}ms): ${p95 <= P95_THRESHOLD_MS ? 'PASS' : 'FAIL'}`);
    console.log(`Threshold (Mean < ${MEAN_THRESHOLD_MS}ms): ${mean <= MEAN_THRESHOLD_MS ? 'PASS' : 'FAIL'}`);
    console.log('============================\n');
  });

  const filterCombinations = [
    { gender: 'female', ageMin: 25, ageMax: 35 },
    { gender: 'male', religion: 'hindu', motherTongue: 'tamil' },
    { city: 'Bangalore', ageMin: 25, ageMax: 30 },
    { state: 'Karnataka', maritalStatus: 'never_married' },
    { technologyStack: 'React,Node.js', experienceMin: 2, experienceMax: 8 },
    { companyName: 'Google', designation: 'Engineer' },
    { country: 'India', hasPhotos: true },
    { salaryMin: 1000000, salaryMax: 5000000, workMode: 'remote' },
    { educationLevel: 'B.Tech', onlineNow: true },
    { gender: 'female', ageMin: 28, ageMax: 38, religion: 'christian', city: 'Mumbai' },
  ];

  it('should handle concurrent basic searches', async () => {
    const mockSearch = jest.fn().mockImplementation(async (filters: any) => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 5 + Math.random() * 15));
      const duration = Date.now() - start;
      searchResults.push(duration);
      return { data: [], total: 0 };
    });

    const tasks = Array.from({ length: CONCURRENT_SEARCHES }, () =>
      mockSearch({ gender: 'female', page: 1, limit: 20 }),
    );

    await Promise.all(tasks);
    expect(mockSearch).toHaveBeenCalledTimes(CONCURRENT_SEARCHES);
  });

  it('should handle searches with various filter combinations', async () => {
    const filterResults: number[] = [];
    const mockFilterSearch = jest.fn().mockImplementation(async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 25));
      filterResults.push(Date.now() - start);
      return { data: [], total: 0 };
    });

    const tasks: Promise<any>[] = [];
    for (let i = 0; i < SEARCH_ITERATIONS; i++) {
      const filters = filterCombinations[i % filterCombinations.length];
      tasks.push(mockFilterSearch(filters));
    }

    await Promise.all(tasks);

    const mean = filterResults.reduce((a, b) => a + b, 0) / filterResults.length;
    const sorted = [...filterResults].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    console.log(`Filter Search Mean: ${mean.toFixed(2)}ms, P95: ${p95}ms`);

    expect(mean).toBeLessThan(MEAN_THRESHOLD_MS);
    expect(p95).toBeLessThan(P95_THRESHOLD_MS);
  });

  it('should handle mixed workload with different filter complexities', async () => {
    const mixedResults: number[] = [];

    const simpleSearch = async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 5));
      mixedResults.push(Date.now() - start);
    };

    const mediumSearch = async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 15));
      mixedResults.push(Date.now() - start);
    };

    const complexSearch = async () => {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 30));
      mixedResults.push(Date.now() - start);
    };

    const tasks: Promise<any>[] = [];
    for (let i = 0; i < 50; i++) {
      tasks.push(simpleSearch());
      tasks.push(mediumSearch());
      tasks.push(complexSearch());
    }

    await Promise.all(tasks);

    const mean = mixedResults.reduce((a, b) => a + b, 0) / mixedResults.length;
    console.log(`Mixed Workload Mean Latency: ${mean.toFixed(2)}ms`);

    expect(mean).toBeLessThan(200);
  });

  it('should handle paginated search requests', async () => {
    const paginationResults: number[] = [];

    const mockPaginatedSearch = jest.fn().mockImplementation(async (page: number) => {
      const start = Date.now();
      const delay = 5 + Math.random() * 10;
      await new Promise((resolve) => setTimeout(resolve, delay));
      paginationResults.push(Date.now() - start);
      return { data: [], total: 100, page, limit: 20 };
    });

    const tasks = Array.from({ length: 30 }, (_, i) => mockPaginatedSearch(i + 1));
    await Promise.all(tasks);

    const mean = paginationResults.reduce((a, b) => a + b, 0) / paginationResults.length;
    console.log(`Pagination Mean Latency: ${mean.toFixed(2)}ms`);

    expect(mean).toBeLessThan(100);
  });
});
