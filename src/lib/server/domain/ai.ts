import { ATHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';

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
					temperature
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
