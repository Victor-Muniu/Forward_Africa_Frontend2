const crypto = require('crypto');

// Use a secret key from environment or generate one for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || 3600; // 1 hour
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || 7 * 24 * 3600; // 7 days

// Simple JWT implementation (header.payload.signature)
class JWTManager {
  // Base64 encoding utility
  static base64UrlEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static base64UrlDecode(str) {
    // Add padding if needed
    str += new Array(5 - str.length % 4).join('=');
    return Buffer.from(
      str.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
  }

  // Generate HMAC signature
  static generateSignature(message, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Create JWT token
  static createToken(payload, expiresIn = JWT_EXPIRES_IN) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;

    const tokenPayload = {
      ...payload,
      iat,
      exp
    };

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const message = `${headerEncoded}.${payloadEncoded}`;

    const signature = this.generateSignature(message, JWT_SECRET);
    const token = `${message}.${signature}`;

    return token;
  }

  // Verify and decode JWT token
  static verifyToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [headerEncoded, payloadEncoded, signature] = parts;
      const message = `${headerEncoded}.${payloadEncoded}`;

      // Verify signature
      const expectedSignature = this.generateSignature(message, JWT_SECRET);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode payload
      const payloadJson = this.base64UrlDecode(payloadEncoded);
      const payload = JSON.parse(payloadJson);

      // Check expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // Create refresh token
  static createRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh'
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + JWT_REFRESH_EXPIRES_IN;

    const tokenPayload = {
      ...payload,
      iat,
      exp
    };

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const message = `${headerEncoded}.${payloadEncoded}`;

    const signature = this.generateSignature(message, JWT_REFRESH_SECRET);
    const token = `${message}.${signature}`;

    return token;
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [headerEncoded, payloadEncoded, signature] = parts;
      const message = `${headerEncoded}.${payloadEncoded}`;

      // Verify signature
      const expectedSignature = this.generateSignature(message, JWT_REFRESH_SECRET);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode payload
      const payloadJson = this.base64UrlDecode(payloadEncoded);
      const payload = JSON.parse(payloadJson);

      // Check expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        throw new Error('Token expired');
      }

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Get token expiry time in milliseconds
  static getTokenExpiryMs(token) {
    try {
      const payload = this.verifyToken(token);
      return payload.exp * 1000;
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTManager;
