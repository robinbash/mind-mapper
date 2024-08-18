import { getAiResponse } from '$lib/server/domain/ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { DomainService } from './types';

import { getSplitTopicPrompt } from '$lib/server/domain/prompts';

export const splitTopic: DomainService<{}, void> = async ({ topicId, userId }) => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);

	const prompt = getSplitTopicPrompt(topic, topicRepo);

	const aiResponse = await getAiResponse({
		messages: [{ role: 'user', content: prompt }]
	});

	const topicSplitJson = JSON.parse(aiResponse);

	console.log(topicSplitJson);

	if (!topicSplitJson.summary || !topicSplitJson.subtopics) {
		throw new Error('Invalid AI response format');
	}
	for (const subtopic of topicSplitJson.subtopics) {
		if (!subtopic.title || !subtopic.summary) {
			throw new Error('Invalid subtopic format');
		}
		await topicRepo.addTopic({
			title: subtopic.title,
			description: subtopic.summary,
			parentId: topic.id
		});
	}
	topic.description = topicSplitJson.summary;
	await topicRepo.updateTopic(topic);
};
