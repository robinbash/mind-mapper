import { ATHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT =
	'You are an assistant of an app designed to discover topics by structuring the users thoughts and asking questions to help draw out the users thoughts. You respond in a very concise manner. You do not act like a person would, you are a tool. You avoid greetings, thanks and other interpersonal phrases, focusing only on the topic.';

/**
 * merge consecutive user or assistant messages in order to assure alternating messages
 */
const mergeMessages = (messages: Anthropic.MessageParam[]) => {
	return messages.reduce(
		(acc: Anthropic.MessageParam[], current: Anthropic.MessageParam, index: number) => {
			if (index === 0 || current.role !== acc[acc.length - 1].role) {
				acc.push(current);
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
						controller.error('Error while streaming ai response');
					})
					.on('abort', (err) => {
						controller.error('Error while streaming ai response');
					});
			} catch (err) {
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
