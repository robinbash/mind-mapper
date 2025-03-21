import { ATHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompts';
import { dev } from '$app/environment';

import { env } from '$env/dynamic/private';
import { VOYAGE_API_KEY } from '$env/static/private';

const useRealAi = env.USE_REAL_AI ?? false;

import {} from '$env/static/public';

const MOCKED_TEXT =
	'This is mocked ai reponse text. To get a real response, start the app in production mode.';

const mockedStreamResponse = () => {
	return new ReadableStream<string>({
		async start(controller) {
			controller.enqueue(MOCKED_TEXT);
			controller.close();
		}
	});
};

/**
 * merge consecutive user or assistant messages in order to assure alternating messages
 */
const mergeMessages = (messages: Anthropic.MessageParam[]) => {
	return messages.reduce(
		(acc: Anthropic.MessageParam[], current: Anthropic.MessageParam, index: number) => {
			if (index === 0 || current.role !== acc[acc.length - 1].role) {
				acc.push({ role: current.role, content: current.content });
			} else {
				acc[acc.length - 1].content += ' ' + current.content;
			}
			return acc;
		},
		[]
	);
};

export const streamAiResponse = ({
	messages,
	model = 'claude-3-7-sonnet-20250219',
	max_tokens = 2000,
	temperature = 0.7
}: {
	messages: Anthropic.MessageParam[];
	model?: Anthropic.MessageCreateParams['model'];
	max_tokens?: number;
	temperature?: number;
}) => {
	if (dev && !useRealAi) {
		return mockedStreamResponse();
	}

	if (!ATHROPIC_API_KEY) {
		throw new Error('No Anthropic api key');
	}

	const client = new Anthropic({
		apiKey: ATHROPIC_API_KEY
	});

	return new ReadableStream<string>({
		async start(controller) {
			try {
				client.messages
					.stream({
						messages: mergeMessages(messages),
						model,
						max_tokens,
						temperature,
						system: SYSTEM_PROMPT
					})
					.on('text', (text) => {
						controller.enqueue(text);
					})
					.on('end', () => {
						controller.close();
					})
					.on('error', (err) => {
						console.error(err);
						controller.error('Error while streaming ai response');
					})
					.on('abort', (err) => {
						console.error(err);
						controller.error('Error while streaming ai response');
					});
			} catch (err) {
				console.error(err);
				controller.error('Error while streaming ai response');
			}
		}
	});
};

export const getAiResponse = async ({
	messages,
	model = 'claude-3-7-sonnet-20250219',
	max_tokens = 2000,
	temperature = 0.7
}: {
	messages: Anthropic.MessageParam[];
	model?: Anthropic.MessageCreateParams['model'];
	max_tokens?: number;
	temperature?: number;
}) => {
	if (dev && !useRealAi) {
		return MOCKED_TEXT;
	}
	if (!ATHROPIC_API_KEY) {
		throw new Error('No Anthropic api key');
	}

	const client = new Anthropic({
		apiKey: ATHROPIC_API_KEY
	});

	const aiResponse = await client.messages.create({
		messages: mergeMessages(messages),
		model,
		max_tokens,
		temperature,
		system: SYSTEM_PROMPT
	});

	if (aiResponse.stop_reason !== 'end_turn') throw new Error('Unexpected stop reason');

	return aiResponse.content
		.filter((c) => c.type === 'text')
		.map((c) => c.text)
		.join();
};

export const getEmbedding = async (
	text: string,
	type: 'document' | 'query' = 'document'
): Promise<number[]> => {
	const headers = {
		Authorization: `Bearer ${VOYAGE_API_KEY}`,
		'Content-Type': 'application/json'
	};
	const data = {
		input: text,
		model: 'voyage-3-large',
		input_type: type,
		output_dimension: 256
	};

	const response = await fetch('https://api.voyageai.com/v1/embeddings', {
		method: 'POST',
		headers,
		body: JSON.stringify(data)
	});

	const responseData = await response.json();
	console.log(responseData);

	return responseData.data[0].embedding;
};
