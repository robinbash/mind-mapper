import type { Topic, Message } from './types';
import { streamAiResponse } from './ai';
import { getTopic } from '$lib/server/topicRepo';

export const getDevelopmentGuidance = async (topicId: string): Promise<ReadableStream<string>> => {
	const topic = await getTopic(topicId);

	console.log(topic);

	return streamAiResponse({ messages: [{ role: 'user', content: 'hi' }] });
};

// topicId: string
export const submitDevelopmentPrompt = (content: string): ReadableStream<string> => {
	// TODO:
	// get topic
	//
	return streamAiResponse({ messages: [{ role: 'user', content }] });
};
