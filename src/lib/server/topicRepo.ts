import type { Topic } from '$lib/server/domain';
import { adminDb } from '$lib/server/firebase-admin';

const TOPICS_COLLECTION = 'topics';

export class TopicRepo {
	private topicsById?: Record<string, Topic>;

	loadTopics = async (userId: string) => {
		const topicDocs = await adminDb
			.collection(TOPICS_COLLECTION)
			.where('userId', '==', userId)
			.get();
		const topics = topicDocs.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Topic[];

		this.topicsById = topics.reduce(
			(acc, topic) => {
				acc[topic.id] = topic;
				return acc;
			},
			{} as Record<string, Topic>
		);
	};

	getTopic = (topicId: string): Topic => {
		if (!this.topicsById) throw new Error('Topics not loaded');
		const topic = this.topicsById[topicId];
		if (!topic) {
			throw new Error('Topic not found');
		}
		return topic;
	};

	getParentTopics = (topicId: string): Topic[] => {
		if (!this.topicsById) throw new Error('Topics not loaded');
		const parentTopics = [];
		let currentTopic = this.topicsById[topicId];
		while (currentTopic.parentId) {
			currentTopic = this.topicsById[currentTopic.parentId];
			parentTopics.unshift(currentTopic);
		}
		return parentTopics;
	};

	getSubtopics = (topicId: string): Topic[] => {
		if (!this.topicsById) throw new Error('Topics not loaded');
		return Object.values(this.topicsById).filter((t) => t.parentId === topicId);
	};

	updateTopic = async (topic: Topic) => {
		const { id, ...update } = topic;
		await adminDb
			.collection(TOPICS_COLLECTION)
			.doc(id)
			.update({ ...update });
	};
}
