import { json, type RequestHandler } from '@sveltejs/kit';
import { authenticateRequest } from '$lib/server/auth-middleware';
import { getDevelopmentGuidance } from '$lib/server/domain';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const token = await authenticateRequest(request);

		const data: { topicId: string; previousQuestions?: string[] } | undefined =
			await request.json();

		if (!data || !data.topicId) {
			throw new Error('No request data');
		}

		const stream = await getDevelopmentGuidance(data.topicId, token.uid, data.previousQuestions);

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
