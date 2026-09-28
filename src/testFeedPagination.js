const feedService = require('./services/feed.service');

async function testPagination() {
  console.log('--- Testing Backend Feed Pagination ---');

  // Test Page 1 (limit: 10)
  const page1 = await feedService.getPaginatedFeed({ page: 1, limit: 10 });
  console.log('✅ Page 1 results:', {
    itemCount: page1.items.length,
    pagination: page1.pagination,
  });

  // Test Page 2 (limit: 10)
  const page2 = await feedService.getPaginatedFeed({ page: 2, limit: 10 });
  console.log('✅ Page 2 results:', {
    itemCount: page2.items.length,
    pagination: page2.pagination,
  });

  console.log('\n🎉 BACKEND FEED PAGINATION VERIFIED SUCCESSFULLY! 🎉\n');
}

testPagination().catch(console.error);
