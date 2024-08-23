import type { Topic } from '$lib/types';
import { adminDb } from '$lib/server/firebase-admin';

import { ROOT_TOPICS, type RootTopicId } from '$lib/common';

const TOPICS_COLLECTION = 'topics';

export class TopicRepo {
	private topicsById?: Record<string, Topic>;
	private userId?: string;

	loadTopics = async (userId: string) => {
		const topicDocs = await adminDb
			.collection(TOPICS_COLLECTION)
			.where('userId', '==', userId)
			.get();
		const topics = topicDocs.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Topic[];

		this.topicsById = [...topics, ...ROOT_TOPICS].reduce(
			(acc, topic) => {
				acc[topic.id] = topic;
				return acc;
			},
			{} as Record<string, Topic>
		);
		this.userId = userId;
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

	getRootTopicId = (topicId: string): RootTopicId => {
		if (!this.topicsById) throw new Error('Topics not loaded');
		if (ROOT_TOPICS.some((t) => t.id === topicId)) {
			return topicId as RootTopicId;
		}
		const parentTopics = this.getParentTopics(topicId);
		return parentTopics[0].id as RootTopicId;
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

	addTopic = async (newTopic: Omit<Topic, 'id'>): Promise<string> => {
		if (!this.userId) throw new Error('Topics not loaded');
		const newDoc = await adminDb
			.collection(TOPICS_COLLECTION)
			.add({ ...newTopic, userId: this.userId });
		return newDoc.id;
	};

	deleteTopic = async (topicId: string) => {
		this.getTopic(topicId);
		await adminDb.collection(TOPICS_COLLECTION).doc(topicId).delete();
	};
}
