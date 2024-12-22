import type { Node, Topic } from '$lib/types';
import { adminDb } from '$lib/server/firebase-admin';

const NODES_COLLECTION = 'nodes';

export class NodeRepo {
	private nodesById?: Record<string, Node>;
	private userId?: string;

	load = async (userId: string) => {
		const nodeDocs = await adminDb.collection(NODES_COLLECTION).where('userId', '==', userId).get();
		const nodes = nodeDocs.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Node[];

		this.nodesById = nodes.reduce(
			(acc, node) => {
				acc[node.id] = node;
				return acc;
			},
			{} as Record<string, Node>
		);
		this.userId = userId;
	};

	getNode = (nodeId: string): Node => {
		if (!this.nodesById) throw new Error('Nodes not loaded');
		const node = this.nodesById[nodeId];
		if (!node) {
			throw new Error('Node not found');
		}
		return node;
	};

	getTopic = (nodeId: string): Topic => {
		if (!this.nodesById) throw new Error('Nodes not loaded');
		const node = this.nodesById[nodeId];
		if (!node || node.type !== 'topic') {
			throw new Error('Node not found');
		}
		return node;
	};

	getRootNodes = (): Node[] => {
		if (!this.nodesById) throw new Error('Nodes not loaded');
		return Object.values(this.nodesById).filter((t) => !t.parentId);
	};

	getParentNodes = (nodeId: string): Node[] => {
		if (!this.nodesById) throw new Error('Nodes not loaded');
		const parentNodes = [];
		let currentNode = this.nodesById[nodeId];
		while (currentNode.parentId) {
			currentNode = this.nodesById[currentNode.parentId];
			parentNodes.unshift(currentNode);
		}
		return parentNodes;
	};

	getChildren = (nodeId: string): Node[] => {
		if (!this.nodesById) throw new Error('Nodes not loaded');
		return Object.values(this.nodesById).filter((t) => t.parentId === nodeId);
	};

	//TODD: implement commit to make proper repo
	updateNode = async (node: Node) => {
		const { id, ...update } = node;
		await adminDb
			.collection(NODES_COLLECTION)
			.doc(id)
			.update({ ...update });
	};

	addTopic = async (newNode: Omit<Topic, 'id' | 'type'>): Promise<string> => {
		if (!this.userId) throw new Error('Nodes not loaded');
		const newDoc = await adminDb
			.collection(NODES_COLLECTION)
			.add({ ...newNode, type: 'topic', userId: this.userId });
		return newDoc.id;
	};

	deleteNode = async (nodeId: string) => {
		this.getNode(nodeId);
		await adminDb.collection(NODES_COLLECTION).doc(nodeId).delete();
	};
}
