import { streamAiResponse } from './ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { Message, Topic } from './types';

const getDevelopmentGuidancePrompt = (topic: Topic, previousQuestions?: string[]): Message[] => {
	const rootPrompt = '';
	const previous: string[] = [...(previousQuestions ?? [])];
	const previousQuestionsPrompt =
		previous.length > 0 ? ` You have already asked this before: ${previous.join(' ')}.` : '';

	const prompt = `Ask me a question to discover more detail about a topic.${rootPrompt} Only respond with a question in one sentence.${previousQuestionsPrompt} This is the topic: ${topic.description}`;
	return [{ role: 'user', content: prompt }];
};

export const getDevelopmentGuidance = async (
	topicId: string,
	userId: string,
	previousQuestions?: string[]
): Promise<ReadableStream<string>> => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	return streamAiResponse({
		messages: getDevelopmentGuidancePrompt(topic, previousQuestions),
		temperature: 0.9
	});
};

export const finishDeveloping = async (topicId: string, messages: Message[]) => {
	console.log(topicId, messages);
};

// topicId: string
export const submitDevelopmentPrompt = (
	topicId: string,
	content: string
): ReadableStream<string> => {
	// TODO:
	// get topic
	//
	return streamAiResponse({ messages: [{ role: 'user', content }] });
};
