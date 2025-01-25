import { writable, get } from 'svelte/store';
import type { Node, Category } from '$lib/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '$lib/firebase';

const NODES_COLLECTION = 'nodes';

function createMindmapStore() {
	const mindmapStore = writable<Node[]>([]);
	const { subscribe, set } = mindmapStore;

	let unsubscribe: () => void;

	const isNodeRoot = (node?: Node) => !!node?.parentId;

	const getNumChildren = (categoryId: string | null) => {
		return get(mindmapStore).filter((node) => node.parentId === categoryId && node.type === 'topic')
			.length;
	};

	const getNumSubtree = (category: Category): number => {
		return get(mindmapStore).reduce((count, node) => {
			if (node.parentId !== category.id) return count;
			if (node.type === 'topic') return count + 1;
			return count + getNumSubtree(node);
		}, 0);
	};

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
		isNodeRoot,
		getNumChildren,
		getNumSubtree
	};
}

export const mindmap = createMindmapStore();
