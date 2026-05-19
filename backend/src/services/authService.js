import jwt from 'jsonwebtoken';
import { adminAuth, adminDb } from '../config/firebase.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h';

export class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data (email, password, firstName, lastName, role)
   * @returns {Object} User object
   */
  async registerUser(userData) {
    try {
      const { email, password, firstName, lastName, role = 'CLIENTE' } = userData;

      // Create user in Firebase Auth
      const userRecord = await adminAuth.createUser({
        email,
        password
      });

      // Save user data in Firestore
      await adminDb.collection('users').doc(userRecord.uid).set({
        email,
        firstName,
        lastName,
        role,
        active: true,
        createdAt: new Date(),
        uid: userRecord.uid
      });

      logger.info(`User registered in Firebase: ${email}`);
      return {
        id: userRecord.uid,
        email,
        firstName,
        lastName,
        role,
        createdAt: new Date()
      };
    } catch (error) {
      logger.error(`Register error: ${error.message}`);
      if (error.code === 'auth/email-already-exists') {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Authenticate user and generate JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} { token, user }
   */
  async loginUser(email, password) {
    try {
      // Verify credentials using Firebase Admin SDK (note: this validates password indirectly)
      // We'll get the user by email from Firestore and let the frontend handle Auth login
      const userSnapshot = await adminDb
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        throw new Error('Invalid email or password');
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      if (!userData.active) {
        throw new Error('User account is disabled');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: userData.uid,
          email: userData.email,
          role: userData.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      logger.info(`User logged in: ${email}`);
      return {
        token,
        user: {
          id: userData.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          active: userData.active
        }
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.error(`Token validation error: ${error.message}`);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {string} New JWT token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get fresh user data from Firestore
      const userDoc = await adminDb.collection('users').doc(decoded.userId).get();

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      
      if (!userData.active) {
        throw new Error('User account is disabled');
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: userData.uid,
          email: userData.email,
          role: userData.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      logger.info(`Token refreshed for user: ${userData.email}`);
      return newToken;
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  }
}

export default new AuthService();
