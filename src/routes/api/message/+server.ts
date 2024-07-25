import { ATHROPIC_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateRequest } from '$lib/server/auth-middleware';

export const POST: RequestHandler = async ({ request }) => {
	try {
		await authenticateRequest(request);

		if (!ATHROPIC_API_KEY) {
			throw new Error('No Anthropic api key');
		}

		const client = new Anthropic({
			apiKey: ATHROPIC_API_KEY
		});

		const data = await request.json();

		if (!data) {
			throw new Error('No request data');
		}

		const stream = new ReadableStream({
			async start(controller) {
				client.messages
					.stream({
						messages: data.messages,
						model: 'claude-3-5-sonnet-20240620',
						max_tokens: 3000,
						temperature: 0.7
					})
					.on('text', (text) => {
						controller.enqueue(text);
					})
					.on('end', () => {
						controller.close();
					})
					.on('error', () => {
						controller.close();
					});
			}
		});

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
