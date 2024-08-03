import { json, type RequestHandler } from '@sveltejs/kit';
import { authenticateRequest } from '$lib/server/auth-middleware';
import { type Message, finishDeveloping } from '$lib/server/domain';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const userId = await authenticateRequest(request);

		const data: { topicId: string; messages: Message[] } | undefined = await request.json();

		if (!data || !data.topicId) {
			throw new Error('No request data');
		}

		await finishDeveloping(data.topicId, userId, data.messages);
		return new Response(null, { status: 200 });
	} catch (err) {
		console.error(err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};
