import { json, type RequestHandler } from '@sveltejs/kit';
import { authenticateRequest } from '$lib/server/auth-middleware';

export const POST: RequestHandler = async ({ request }) => {
	try {
		await authenticateRequest(request);

		return json({ foo: 'bar' });
	} catch (err) {
		console.error(err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};
