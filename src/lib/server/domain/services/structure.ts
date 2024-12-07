import { getAiResponse } from '$lib/server/domain/ai';
import { TopicRepo } from '$lib/server/topicRepo';
import type { DomainService } from './types';
import { type Topic } from '$lib/types';

import { getSplitTopicPrompt, getCategorizePrompt } from '$lib/server/domain/prompts';

// TODO: Transaction or pre validate json reponse

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
			parentId: topic.id,
			messages: []
		});
	}
	topic.description = topicSplitJson.summary;
	await topicRepo.updateTopic(topic);
};

export const categorize: DomainService<{}, void> = async ({ topicId, userId }) => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);
	const allSubtopics = topicRepo.getSubtopics(topic.id);

	const prompt = getCategorizePrompt(topic, topicRepo);

	const aiResponse = await getAiResponse({
		messages: [{ role: 'user', content: prompt }]
	});

	const categorizeJson = JSON.parse(aiResponse);

	console.log(categorizeJson);

	if (!Array.isArray(categorizeJson)) {
		throw new Error('Invalid AI response format');
	}

	const categoryMap: Record<string, Topic[]> = categorizeJson.reduce((acc, category) => {
		if (!category.title || !category.subtopics) {
			throw new Error('Invalid category format');
		}
		const subtopics = category.subtopics.map((title: string) => {
			const subtopic = allSubtopics.find((t) => t.title === title);
			if (!subtopic) {
				throw new Error(`Subtopic "${category.title}" not found`);
			}
			return subtopic;
		});
		acc[category.title] = subtopics;
		return acc;
	}, {});

	for (const [title, subtopics] of Object.entries(categoryMap)) {
		const categoryId = await topicRepo.addTopic({
			title,
			description: '',
			parentId: topic.id,
			messages: []
		});

		for (const subtopic of subtopics) {
			subtopic.parentId = categoryId;
			await topicRepo.updateTopic(subtopic);
		}
	}
};
