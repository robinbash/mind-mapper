import { ATHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompts';
import { dev } from '$app/environment';

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
	model = 'claude-3-5-sonnet-20240620',
	max_tokens = 2000,
	temperature = 0.7
}: {
	messages: Anthropic.MessageParam[];
	model?: Anthropic.MessageCreateParams['model'];
	max_tokens?: number;
	temperature?: number;
}) => {
	if (dev) {
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
	model = 'claude-3-5-sonnet-20240620',
	max_tokens = 2000,
	temperature = 0.7
}: {
	messages: Anthropic.MessageParam[];
	model?: Anthropic.MessageCreateParams['model'];
	max_tokens?: number;
	temperature?: number;
}) => {
	if (dev) {
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
