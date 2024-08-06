import { adminAuth } from './firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';

import type { DomainService } from './domain';

export async function authenticateRequest(request: Request) {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw error(401, 'Unauthorized');
	}

	const idToken = authHeader.split('Bearer ')[1];

	try {
		const decodedToken = await adminAuth.verifyIdToken(idToken);
		return decodedToken.uid;
	} catch (err) {
		console.error('Error verifying auth token:', err);
		throw error(401, 'Unauthorized');
	}
}

export const PostSimple =
	<TParams>(service: DomainService<TParams, string | void>): RequestHandler =>
	async ({ request }) => {
		try {
			const userId = await authenticateRequest(request);

			const data: (TParams & { topicId: string }) | undefined = await request.json();

			if (!data || !data.topicId) {
				throw new Error('No request data');
			}

			const result = await service({ ...data, userId });
			return json({ result });
		} catch (err) {
			console.error(err);
			return json({ error: 'There was an error processing your request' }, { status: 500 });
		}
	};

export const PostStream =
	<TParams>(service: DomainService<TParams, ReadableStream<string>>): RequestHandler =>
	async ({ request }) => {
		try {
			const userId = await authenticateRequest(request);
			const data: (TParams & { topicId: string }) | undefined = await request.json();

			if (!data || !data.topicId) {
				throw new Error('No request data');
			}

			const stream = await service({ ...data, userId });

			return new Response(stream, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive'
				}
			});
		} catch (err) {
			console.error(err);
			return json({ error: 'There was an error processing your request' }, { status: 500 });
		}
	};
