import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FIREBASE_SERVICE_ACCOUNT } from '$env/static/private';

const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT || '{}');

if (!getApps().length) {
	initializeApp({
		credential: cert(serviceAccount)
	});
}

export const adminAuth = getAuth();
