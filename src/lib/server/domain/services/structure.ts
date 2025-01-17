import { getAiResponse } from '$lib/server/domain/ai';
import { NodeRepo } from '$lib/server/nodeRepo';
import type { DomainService } from './types';
import type { Node } from '$lib/types';

import { getSplitTopicPrompt, getCategorizePrompt } from '$lib/server/domain/prompts';

// TODO: Transaction or pre validate json reponse

export const splitTopic: DomainService<{ topicId: string }, void> = async ({ topicId, userId }) => {
	const nodeRepo = new NodeRepo();
	await nodeRepo.load(userId);
	const topic = nodeRepo.getTopic(topicId);

	const prompt = getSplitTopicPrompt(topic, nodeRepo);

	const aiResponse = await getAiResponse({
		messages: [{ role: 'user', content: prompt }]
	});

	const topicSplitJson = JSON.parse(aiResponse);

	if (!topicSplitJson.summary || !topicSplitJson.subtopics) {
		throw new Error('Invalid AI response format');
	}
	for (const subtopic of topicSplitJson.subtopics) {
		if (!subtopic.title || !subtopic.summary) {
			throw new Error('Invalid subtopic format');
		}
		await nodeRepo.addTopic({
			title: subtopic.title,
			summary: subtopic.summary,
			parentId: topic.id,
			messages: [],
			embedding: []
		});
	}
	topic.summary = topicSplitJson.summary;
	await nodeRepo.updateNode(topic);
};

export const categorize: DomainService<{ topicId?: string }, void> = async ({
	topicId,
	userId
}) => {
	const nodeRepo = new NodeRepo();
	await nodeRepo.load(userId);
	let nodes: Node[];
	if (topicId) {
		const topic = nodeRepo.getTopic(topicId);
		nodes = nodeRepo.getChildren(topic.id);
	} else {
		nodes = nodeRepo.getRootNodes();
	}
};
