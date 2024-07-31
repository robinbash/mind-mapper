import { ATHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT =
	'You are an assistant of an app designed to discover topics by structuring the users thoughts and asking questions to help draw out the users thoughts. You respond in a very concise manner. You do not act like a person would, you are a tool. You avoid greetings, thanks and other interpersonal phrases, focusing only on the topic.';

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
			client.messages
				.stream({
					messages,
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
				.on('error', () => {
					controller.close();
				});
		}
	});
};
