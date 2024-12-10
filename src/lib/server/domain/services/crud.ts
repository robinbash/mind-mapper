import { TopicRepo } from '$lib/server/topicRepo';
import type { Message } from '$lib/types';
import type { DomainService } from './types';

export const deleteTopic: DomainService<{}, void> = async ({ topicId, userId }) => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);

	const deleteWithSubtopics = async (id: string) => {
		for (const subtopic of topicRepo.getSubtopics(id)) {
			await deleteWithSubtopics(subtopic.id);
		}
		await topicRepo.deleteTopic(id);
	};

	await deleteWithSubtopics(topicId);
};

export const addMessages: DomainService<{ messages: Message[] }, void> = async ({
	topicId,
	userId,
	messages
}) => {
	const topicRepo = new TopicRepo();
	await topicRepo.loadTopics(userId);
	const topic = topicRepo.getTopic(topicId);
	topic.messages = [...(topic.messages ?? []), ...messages];
	topicRepo.updateTopic(topic);
};
