const authService = require('./services/auth.service');
const { verifyAccessToken, verifyRefreshToken } = require('./utils/jwt.util');

async function testAuthModule() {
  console.log('--- Testing JWT Authentication Module ---');

  const testMobile = '9876543210';
  const testUser = {
    id: 9999,
    mobile: testMobile,
    name: 'Test Agent',
    email: 'agent@indiadits.com',
    isRealEstateAgent: true,
  };

  try {
    // 1. Test serializeUser
    const serialized = authService.serializeUser(testUser);
    console.log('✅ Serialized user:', serialized);

    // 2. Test Token Generation
    const { generateAccessToken, generateRefreshToken } = require('./utils/jwt.util');
    const accessToken = generateAccessToken(testUser);
    const refreshToken = generateRefreshToken(testUser);
    console.log('✅ Generated Access Token:', accessToken.slice(0, 30) + '...');
    console.log('✅ Generated Refresh Token:', refreshToken.slice(0, 30) + '...');

    // 3. Test Token Verification
    const decodedAccess = verifyAccessToken(accessToken);
    console.log('✅ Decoded Access Token:', decodedAccess);
    if (decodedAccess.id !== testUser.id || decodedAccess.mobile !== testMobile) {
      throw new Error('Access token payload mismatch!');
    }

    const decodedRefresh = verifyRefreshToken(refreshToken);
    console.log('✅ Decoded Refresh Token:', decodedRefresh);
    if (decodedRefresh.id !== testUser.id || decodedRefresh.type !== 'REFRESH_TOKEN') {
      throw new Error('Refresh token payload mismatch!');
    }

    console.log('\n🎉 ALL JWT AUTHENTICATION UNIT TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('❌ Auth test error:', err);
  }
}

testAuthModule();
