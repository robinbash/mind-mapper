import { streamAiResponse } from '$lib/server/domain/ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { DevelopmentInProgress, Topic, Message } from '$lib/types';
import type { DomainService } from './types';

export const submitPromptForNewTopic: DomainService<
	{ messages: Message[]; prompt: string },
	ReadableStream<string>
> = async ({ messages, prompt }): Promise<ReadableStream<string>> => {
	return streamAiResponse({
		messages: [...messages, { role: 'user', content: prompt }],
		temperature: 0.9
	});
};
