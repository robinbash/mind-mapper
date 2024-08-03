import { json, type RequestHandler } from '@sveltejs/kit';
import { type Message, submitDevelopmentPrompt } from '$lib/server/domain';
import { authenticateRequest } from '$lib/server/auth-middleware';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const userId = await authenticateRequest(request);
		const data: { topicId: string; prompt: string; previousMessages: Message[] } =
			await request.json();

		if (!data || !data.topicId || !data.prompt || !data.previousMessages) {
			throw new Error('No request data');
		}

		const stream = await submitDevelopmentPrompt(
			data.topicId,
			userId,
			data.prompt,
			data.previousMessages
		);

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
