const { 
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const base64url = require('base64url');
const crypto = require('crypto');
const config = require('../config/auth');
const redis = require('../utils/redis');
const { User, WebAuthnCredential } = require('../models');

class WebAuthnService {
  constructor() {
    this.rpName = config.webauthn.rpName;
    this.rpId = config.webauthn.rpId;
    this.origin = config.webauthn.origin;
    this.challengeTTL = config.webauthn.challengeTTL;
  }

  async generateChallenge() {
    return base64url.encode(crypto.randomBytes(32));
  }

  async storeChallenge(userId, challenge) {
    const key = `${config.redis.challengePrefix}${userId}`;
    await redis.set(key, challenge, 'PX', this.challengeTTL);
  }

  async verifyChallenge(userId, challenge) {
    const key = `${config.redis.challengePrefix}${userId}`;
    const storedChallenge = await redis.get(key);
    await redis.del(key);
    return storedChallenge === challenge;
  }

  async generateRegistrationOptions(user) {
    const challenge = await this.generateChallenge();
    await this.storeChallenge(user.id, challenge);

    const existingCredentials = await WebAuthnCredential.find({ userId: user.id });

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpId,
      userID: user.id,
      userName: user.email,
      userDisplayName: `${user.firstName} ${user.lastName}`,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: config.webauthn.authenticatorAttachment,
        userVerification: config.webauthn.userVerification,
      },
      timeout: config.webauthn.timeout,
      challenge,
      excludeCredentials: existingCredentials.map(cred => ({
        id: base64url.toBuffer(cred.credentialId),
        type: 'public-key',
        transports: cred.transports,
      })),
    });

    return options;
  }

  async verifyRegistration(user, credential) {
    const challenge = await redis.get(`${config.redis.challengePrefix}${user.id}`);
    if (!challenge) {
      throw new Error('Challenge not found or expired');
    }

    const verification = await verifyRegistrationResponse({
      credential,
      expectedChallenge: challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
    });

    if (verification.verified) {
      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

      await WebAuthnCredential.create({
        userId: user.id,
        credentialId: base64url.encode(credentialID),
        publicKey: credentialPublicKey.toString('base64'),
        counter,
        transports: credential.transports || [],
      });

      await redis.del(`${config.redis.challengePrefix}${user.id}`);
    }

    return verification;
  }

  async generateAuthenticationOptions(user) {
    const challenge = await this.generateChallenge();
    await this.storeChallenge(user.id, challenge);

    const credentials = await WebAuthnCredential.find({ userId: user.id });
    if (!credentials.length) {
      throw new Error('No credentials found for this user');
    }

    return await generateAuthenticationOptions({
      rpID: this.rpId,
      timeout: config.webauthn.timeout,
      allowCredentials: credentials.map(cred => ({
        id: base64url.toBuffer(cred.credentialId),
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification: config.webauthn.userVerification,
      challenge,
    });
  }

  async verifyAuthentication(user, credential) {
    const challenge = await redis.get(`${config.redis.challengePrefix}${user.id}`);
    if (!challenge) {
      throw new Error('Challenge not found or expired');
    }

    const userCredential = await WebAuthnCredential.findOne({
      userId: user.id,
      credentialId: credential.id,
    });

    if (!userCredential) {
      throw new Error('Credential not found');
    }

    const verification = await verifyAuthenticationResponse({
      credential,
      expectedChallenge: challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      authenticator: {
        credentialPublicKey: Buffer.from(userCredential.publicKey, 'base64'),
        credentialID: base64url.toBuffer(userCredential.credentialId),
        counter: userCredential.counter,
      },
    });

    if (verification.verified) {
      userCredential.counter = verification.authenticationInfo.newCounter;
      await userCredential.save();
      await redis.del(`${config.redis.challengePrefix}${user.id}`);
    }

    return verification;
  }
}

module.exports = new WebAuthnService(); 