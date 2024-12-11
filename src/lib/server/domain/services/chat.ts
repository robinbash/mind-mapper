import { streamAiResponse, getAiResponse } from '$lib/server/domain/ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { Topic, Message } from '$lib/types';
import type { DomainService } from './types';
import { NEW_TOPIC_PROMPT } from '$lib/server/domain/prompts';

export const submitPrompt: DomainService<
	{ messages: Message[]; prompt: string },
	ReadableStream<string>
> = async ({ topicId, messages, prompt }): Promise<ReadableStream<string>> => {
	return streamAiResponse({
		messages: [...messages, { role: 'user', content: prompt }],
		temperature: 0.9
	});
};

export const submitPromptForNewTopic: DomainService<
	{ messages: Message[]; prompt: string },
	ReadableStream<string>
> = async ({ messages, prompt }): Promise<ReadableStream<string>> => {
	return streamAiResponse({
		messages: [...messages, { role: 'user', content: prompt }],
		temperature: 0.9
	});
};

export const saveNewTopic: DomainService<
	{ messages: Message[]; parentId: string | null },
	string
> = async ({ messages, parentId, userId }): Promise<string> => {
	console.log('start');
	const topicRepo = new TopicRepo();

	await topicRepo.loadTopics(userId);
	console.log('loaded');

	const topicInfo = await getAiResponse({
		messages: [...messages, { role: 'user', content: NEW_TOPIC_PROMPT }]
	});
	console.log('got response');
	const topicInfoJson = JSON.parse(topicInfo);
	if (!topicInfoJson.title || !topicInfoJson.summary) {
		throw new Error('Invalid subtopic format');
	}

	const topic = {
		messages,
		parentId: parentId ?? null,
		title: topicInfoJson.title,
		description: topicInfoJson.summary
	};

	const newTopicId = topicRepo.addTopic(topic);
	console.log('added topic');
	return newTopicId;
};
