import { json, type RequestHandler } from '@sveltejs/kit';
import { submitDevelopmentPrompt } from '$lib/server/domain';
import { authenticateRequest } from '$lib/server/auth-middleware';

export const POST: RequestHandler = async ({ request }) => {
	try {
		await authenticateRequest(request);
		const data: { content: string } = await request.json();

		if (!data || !data.content) {
			throw new Error('No request data');
		}

		const stream = submitDevelopmentPrompt(data.content);

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
