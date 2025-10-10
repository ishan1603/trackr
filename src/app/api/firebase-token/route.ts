import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST() {
  try {
    // Verify the user is authenticated with Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a Firebase custom token for this user
    const firebaseToken = await admin.auth().createCustomToken(userId);
    
    return NextResponse.json({ token: firebaseToken });
  } catch (error) {
    console.error('Error creating Firebase token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}