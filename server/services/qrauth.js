const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/auth');
const redis = require('../utils/redis');

class QRAuthService {
  constructor() {
    this.authentikClient = axios.create({
      baseURL: config.authentik.baseURL,
      headers: {
        'Authorization': `Bearer ${config.authentik.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    this.sessionTTL = config.qrauth.sessionTTL;
    this.pollInterval = config.qrauth.pollInterval;
  }

  async generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  async createAuthSession() {
    const sessionId = await this.generateSessionId();
    const response = await this.authentikClient.post('/api/v3/flows/executor/qr/', {
      session_id: sessionId,
      flow_slug: config.authentik.qrFlowSlug
    });

    const { qr_url, token } = response.data;
    
    await redis.set(
      `${config.redis.qrSessionPrefix}${sessionId}`,
      JSON.stringify({ token, status: 'pending' }),
      'PX',
      this.sessionTTL
    );

    return {
      sessionId,
      qrUrl: qr_url,
      pollInterval: this.pollInterval
    };
  }

  async checkAuthStatus(sessionId) {
    const key = `${config.redis.qrSessionPrefix}${sessionId}`;
    const sessionData = await redis.get(key);
    
    if (!sessionData) {
      throw new Error('Session not found or expired');
    }

    const { token, status } = JSON.parse(sessionData);
    
    if (status === 'completed') {
      await redis.del(key);
      return { status, token };
    }

    try {
      const response = await this.authentikClient.get(`/api/v3/flows/executor/qr/${sessionId}/`);
      const { status: newStatus } = response.data;

      if (newStatus === 'completed') {
        await redis.set(
          key,
          JSON.stringify({ token, status: 'completed' }),
          'PX',
          this.sessionTTL
        );
        return { status: 'completed', token };
      }

      return { status: 'pending' };
    } catch (error) {
      if (error.response?.status === 404) {
        return { status: 'pending' };
      }
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const response = await this.authentikClient.post('/api/v3/flows/executor/qr/verify/', {
        token
      });
      
      const { user_id, email } = response.data;
      return { userId: user_id, email };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new QRAuthService(); 