import { streamAiResponse } from './ai';
import { getTopic } from '$lib/server/topicRepo';
import type { Message, Topic } from './types';

const getDevelopmentGuidancePrompt = (topic: Topic, previousQuestions?: string[]): Message[] => {
	const previous: string[] = [...(previousQuestions ?? [])];
	const previousQuestionsPrompt =
		previous.length > 0 ? ` You have already asked this before: ${previous.join(' ')}.` : '';

	const prompt = `Ask me a question to discover more detail about a topic. Only respond with a question in one sentence.${previousQuestionsPrompt} This is the topic: ${topic.description}`;
	return [{ role: 'user', content: prompt }];
};

export const getDevelopmentGuidance = async (
	topicId: string,
	previousQuestions?: string[]
): Promise<ReadableStream<string>> => {
	const topic = await getTopic(topicId);
	return streamAiResponse({
		messages: getDevelopmentGuidancePrompt(topic, previousQuestions),
		temperature: 0.9
	});
};

// topicId: string
export const submitDevelopmentPrompt = (content: string): ReadableStream<string> => {
	// TODO:
	// get topic
	//
	return streamAiResponse({ messages: [{ role: 'user', content }] });
};
