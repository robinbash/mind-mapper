import { TopicRepo } from '$lib/server/topicRepo';
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
