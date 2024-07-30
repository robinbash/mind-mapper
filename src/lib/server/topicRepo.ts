import type { Topic } from '$lib/server/domain';
import { adminDb } from '$lib/server/firebase-admin';

export const getTopic = async (topicId: string): Promise<Topic | undefined> => {
	return (await adminDb.collection('nodes').doc(topicId).get()).data() as Topic | undefined;
};
