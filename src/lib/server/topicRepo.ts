import type { Topic } from '$lib/server/domain';
import { adminDb } from '$lib/server/firebase-admin';

export const getTopic = async (topicId: string): Promise<Topic> => {
	const topic = (await adminDb.collection('nodes').doc(topicId).get()).data() as Topic | undefined;
	if (!topic) {
		throw new Error('Topic not found');
	}
	return topic;
};
