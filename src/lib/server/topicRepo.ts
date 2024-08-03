import type { Topic } from '$lib/server/domain';
import { adminDb } from '$lib/server/firebase-admin';

const TOPICS_COLLECTION = 'topics';

export class TopicRepo {
	private topicMap?: Record<string, Topic>;

	loadTopics = async (userId: string) => {
		const topicDocs = await adminDb
			.collection(TOPICS_COLLECTION)
			.where('userId', '==', userId)
			.get();
		const topics = topicDocs.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Topic[];
		this.topicMap = topics.reduce(
			(acc, topic) => {
				acc[topic.id] = topic;
				return acc;
			},
			{} as Record<string, Topic>
		);
	};

	getTopic = (topicId: string): Topic => {
		if (!this.topicMap) throw new Error('Topics not loaded');
		const topic = this.topicMap[topicId];
		if (!topic) {
			throw new Error('Topic not found');
		}
		return topic;
	};

	getParentTopics = (topicId: string): Topic[] => {
		if (!this.topicMap) throw new Error('Topics not loaded');
		const parentTopics = [];
		let currentTopic = this.topicMap[topicId];
		while (currentTopic.parentId) {
			currentTopic = this.topicMap[currentTopic.parentId];
			parentTopics.unshift(currentTopic);
		}
		return parentTopics;
	};

	updateTopic = async (topic: Topic) => {
		const { id, ...update } = topic;
		await adminDb
			.collection(TOPICS_COLLECTION)
			.doc(id)
			.update({ ...update });
	};
}
