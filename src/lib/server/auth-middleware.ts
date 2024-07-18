import { adminAuth } from './firebase-admin';
import { error } from '@sveltejs/kit';

export async function authenticateRequest(request: Request) {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw error(401, 'Unauthorized');
	}

	const idToken = authHeader.split('Bearer ')[1];

	try {
		const decodedToken = await adminAuth.verifyIdToken(idToken);
		return decodedToken;
	} catch (err) {
		console.error('Error verifying auth token:', err);
		throw error(401, 'Unauthorized');
	}
}
