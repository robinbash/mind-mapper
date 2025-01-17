import { streamAiResponse, getAiResponse, getEmbedding } from '$lib/server/domain/ai';
import { NodeRepo } from '$lib/server/nodeRepo';
import type { Topic, Message } from '$lib/types';
import type { DomainService } from './types';
import { NEW_TOPIC_PROMPT } from '$lib/server/domain/prompts';
import { multiply, transpose } from 'mathjs';

export const submitPrompt: DomainService<
	{ messages: Message[]; prompt: string },
	ReadableStream<string>
> = async ({ messages, prompt }): Promise<ReadableStream<string>> => {
	return streamAiResponse({
		messages: [...messages, { role: 'user', content: prompt }],
		temperature: 0.9
	});
};

export const getQueryMatches: DomainService<{ query: string }, string[]> = async ({
	query,
	userId
}) => {
	const nodeRepo = new NodeRepo();
	await nodeRepo.load(userId);
	const topics = nodeRepo.getTopics();

	const queryEmbedding = await getEmbedding(query, 'query');
	const topicEmbeddings = topics.map((topic) => topic.embedding);

	const thresh = 0.56;

	const similarities = multiply(queryEmbedding, transpose(topicEmbeddings));
	console.log('similarities', similarities);

	const matches = similarities.reduce((acc, sim, idx) => {
		if ((sim as number) >= thresh) acc.push(topics[idx].id);
		return acc;
	}, [] as string[]);

	return matches;
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
