import { writable } from 'svelte/store';
import type { Topic } from '$lib/types';
import {
	collection,
	onSnapshot,
	addDoc,
	updateDoc,
	doc,
	query,
	where,
	serverTimestamp
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import { goto } from '$app/navigation';
import { ROOT_TOPICS } from '$lib/common';

const TOPICS_COLLECTION = 'topics';

function createMindmapStore() {
	const { subscribe, set } = writable<Topic[]>([]);

	let unsubscribe: () => void;

	const isTopicRoot = (topic?: Topic) =>
		topic ? ROOT_TOPICS.some((root) => root.id === topic.id) : true;

	const saveTopic = async ({
		parentId,
		description,
		title,
		userId
	}: {
		parentId: string;
		description: string;
		title: string;
		userId: string;
	}) => {
		const { id } = await addDoc(collection(db, TOPICS_COLLECTION), {
			parentId,
			title,
			description,
			userId,
			created: serverTimestamp()
		});
		goto(`/${id}`);
		// updateDoc(doc(db, TOPICS_COLLECTION, Topic.id), { messages: Topic.messages });
	};

	return {
		subscribe,
		saveTopic,
		init: (userId: string) => {
			const colRef = collection(db, TOPICS_COLLECTION);
			const q = query(colRef, where('userId', '==', userId));
			unsubscribe = onSnapshot(q, (snapshot) => {
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				})) as Topic[];
				set([...ROOT_TOPICS, ...data]);
			});
		},
		destroy: () => {
			if (unsubscribe) {
				unsubscribe();
			}
		},
		isTopicRoot
	};
}

export const mindmap = createMindmapStore();
