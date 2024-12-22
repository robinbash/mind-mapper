import { writable } from 'svelte/store';
import type { Node } from '$lib/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '$lib/firebase';

const NODES_COLLECTION = 'nodes';

function createMindmapStore() {
	const { subscribe, set } = writable<Node[]>([]);

	let unsubscribe: () => void;

	const isNodeRoot = (node?: Node) => !!node?.parentId;

	return {
		subscribe,
		init: (userId: string) => {
			const colRef = collection(db, NODES_COLLECTION);
			const q = query(colRef, where('userId', '==', userId));
			unsubscribe = onSnapshot(q, (snapshot) => {
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				})) as Node[];
				set(data);
			});
		},
		destroy: () => {
			if (unsubscribe) {
				unsubscribe();
			}
		},
		isNodeRoot
	};
}

export const mindmap = createMindmapStore();
