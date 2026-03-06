import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("firebaseAdmin");


dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Firebase Admin SDK
let firebaseAdmin: admin.app.App | null = null;

const initializeFirebaseAdmin = (): admin.app.App => {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error(
        'Firebase Admin SDK credentials are missing. Please check your .env file:\n' +
        '- FIREBASE_PROJECT_ID\n' +
        '- FIREBASE_PRIVATE_KEY\n' +
        '- FIREBASE_CLIENT_EMAIL'
      );
    }

    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      firebaseAdmin = admin.app();
      log.info('✅ Firebase Admin SDK already initialized');
      return firebaseAdmin;
    }

    // Initialize Firebase Admin
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });

    log.info('✅ Firebase Admin SDK initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    log.error({ err: error }, '❌ Firebase Admin SDK initialization failed:');
    throw error;
  }
};

// Get Firebase Admin instance
export const getFirebaseAdmin = (): admin.app.App => {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
};

// Get Firebase Messaging instance
export const getFirebaseMessaging = (): admin.messaging.Messaging => {
  const adminApp = getFirebaseAdmin();
  return admin.messaging(adminApp);
};

// Initialize on import (optional - can also be called manually)
export default initializeFirebaseAdmin();
