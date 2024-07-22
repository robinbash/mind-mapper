import { writable } from 'svelte/store';
import type { MindNode } from '$lib/types';
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

const MIND_NODE_COLLECTION = 'nodes';

const ROOT_NODES: MindNode[] = [
	{
		id: 'goals',
		title: 'Goals',
		description: 'Everything I want to have done at some point in my life.'
	},
	{
		id: 'ideas',
		title: 'Ideas',
		description: 'Thoughts I have had that might grow into something great.'
	},
	{
		id: 'discovery',
		title: 'Discovery',
		description: 'Journeys to learn about my own mind and anything beyond.'
	}
];

function createMindmapStore() {
	const { subscribe, set } = writable<MindNode[]>([]);

	let unsubscribe: () => void;

	const saveMindNode = async ({
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
		const { id } = await addDoc(collection(db, MIND_NODE_COLLECTION), {
			parentId,
			title,
			description,
			userId,
			childIds: [],
			created: serverTimestamp()
		});
		goto(`/${id}`);
		// updateDoc(doc(db, MIND_NODE_COLLECTION, mindNode.id), { messages: mindNode.messages });
	};

	return {
		subscribe,
		saveMindNode,
		init: (userId: string) => {
			const colRef = collection(db, MIND_NODE_COLLECTION);
			const q = query(colRef, where('userId', '==', userId));
			unsubscribe = onSnapshot(q, (snapshot) => {
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				})) as MindNode[];
				set([...ROOT_NODES, ...data]);
			});
		},
		destroy: () => {
			if (unsubscribe) {
				unsubscribe();
			}
		}
	};
}

export const mindmap = createMindmapStore();
