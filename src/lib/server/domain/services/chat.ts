import { streamAiResponse, getAiResponse, getEmbedding } from '$lib/server/domain/ai';
import { NodeRepo } from '$lib/server/nodeRepo';
import type { Topic, Message } from '$lib/types';
import type { DomainService } from './types';
import { NEW_TOPIC_PROMPT } from '$lib/server/domain/prompts';

export const submitPrompt: DomainService<
	{ messages: Message[]; prompt: string },
	ReadableStream<string>
> = async ({ messages, prompt }): Promise<ReadableStream<string>> => {
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
	const nodeRepo = new NodeRepo();
	await nodeRepo.load(userId);

	const topicInfo = await getAiResponse({
		messages: [...messages, { role: 'user', content: NEW_TOPIC_PROMPT }]
	});
	const topicInfoJson = JSON.parse(topicInfo);
	if (!topicInfoJson.title || !topicInfoJson.summary) {
		throw new Error('Invalid subtopic format');
	}
	const title = topicInfoJson.title;
	const summary = topicInfoJson.summary;

	const topicDocument = `${title}\n\n${summary}`;
	const embedding = await getEmbedding(topicDocument);

	const topic = {
		messages,
		parentId: parentId ?? null,
		title,
		summary,
		embedding
	};

	const newTopicId = nodeRepo.addTopic(topic);
	return newTopicId;
};
