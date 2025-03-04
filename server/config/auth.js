const config = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },

  // Authentik OAuth2 Configuration
  authentik: {
    clientId: process.env.AUTHENTIK_CLIENT_ID,
    clientSecret: process.env.AUTHENTIK_CLIENT_SECRET,
    issuer: process.env.AUTHENTIK_ISSUER,
    authorizationEndpoint: `${process.env.AUTHENTIK_URL}/application/o/authorize`,
    tokenEndpoint: `${process.env.AUTHENTIK_URL}/application/o/token`,
    userInfoEndpoint: `${process.env.AUTHENTIK_URL}/application/o/userinfo`,
    callbackUrl: `${process.env.APP_URL}/api/v1/auth/authentik/callback`,
    scope: 'openid profile email',
  },

  // WebAuthn Configuration
  webauthn: {
    rpName: 'Dental Clinic',
    rpId: process.env.WEBAUTHN_RP_ID || 'localhost',
    origin: process.env.APP_URL || 'http://localhost:3000',
    challengeTTL: 5 * 60 * 1000, // 5 minutes
    authenticatorAttachment: 'platform',
    userVerification: 'required',
    timeout: 60000,
  },

  // QR Code Authentication Configuration
  qrCode: {
    sessionTTL: 5 * 60 * 1000, // 5 minutes
    pollInterval: 2000, // 2 seconds
    qrCodeSize: 256,
  },

  // Redis Configuration for Session Storage
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    prefix: 'auth:',
    sessionPrefix: 'session:',
    challengePrefix: 'challenge:',
  },
};

module.exports = config; 