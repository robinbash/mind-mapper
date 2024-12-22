import { getAiResponse } from '$lib/server/domain/ai';
import { NodeRepo } from '$lib/server/nodeRepo';
import type { DomainService } from './types';
import type { Node, Topic } from '$lib/types';

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
	// case 1:
	// all topics, cluster them into 1-3 categories
	// leave outlier topics
	// unless there are too many outliers, then force them into categories
	// special category for that?
	// -> yes seems nice: "new topics" or "Uncategorized" or "Miscellaneous"
	// needs to be special, its not in the db

	// case 2:
	// too many categories on root
	// cluster them into 1-3 categories
	// renaming might be necessary

	// case 3:

	// const prompt = getCategorizePrompt(topic, nodeRepo);

	// const aiResponse = await getAiResponse({
	// 	messages: [{ role: 'user', content: prompt }]
	// });

	// const categorizeJson = JSON.parse(aiResponse);

	// console.log(categorizeJson);

	// if (!Array.isArray(categorizeJson)) {
	// 	throw new Error('Invalid AI response format');
	// }

	// const categoryMap: Record<string, Topic[]> = categorizeJson.reduce((acc, category) => {
	// 	if (!category.title || !category.subtopics) {
	// 		throw new Error('Invalid category format');
	// 	}
	// 	const subtopics = category.subtopics.map((title: string) => {
	// 		const subtopic = allSubtopics.find((t) => t.title === title);
	// 		if (!subtopic) {
	// 			throw new Error(`Subtopic "${category.title}" not found`);
	// 		}
	// 		return subtopic;
	// 	});
	// 	acc[category.title] = subtopics;
	// 	return acc;
	// }, {});

	// for (const [title, subtopics] of Object.entries(categoryMap)) {
	// 	const categoryId = await nodeRepo.addTopic({
	// 		title,
	// 		summary: '',
	// 		parentId: topic.id,
	// 		messages: [],
	// 		embedding: []
	// 	});

	// 	for (const subtopic of subtopics) {
	// 		subtopic.parentId = categoryId;
	// 		await nodeRepo.updateTopic(subtopic);
	// 	}
	// }
};
