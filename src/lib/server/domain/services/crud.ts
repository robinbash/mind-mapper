import { NodeRepo } from '$lib/server/nodeRepo';
import type { Message } from '$lib/types';
import type { DomainService } from './types';

export const deleteNode: DomainService<{ nodeId: string }, void> = async ({ nodeId, userId }) => {
	const nodeRepo = new NodeRepo();
	await nodeRepo.load(userId);

	const deleteWithChildren = async (id: string) => {
		for (const child of nodeRepo.getChildren(id)) {
			await deleteWithChildren(child.id);
		}
		await nodeRepo.deleteNode(id);
	};

	await deleteWithChildren(nodeId);
};

export const addMessages: DomainService<{ topicId: string; messages: Message[] }, void> = async ({
	topicId,
	userId,
	messages
}) => {
	const nodeRepo = new NodeRepo();
	await nodeRepo.load(userId);
	const topic = nodeRepo.getTopic(topicId);
	topic.messages = [...(topic.messages ?? []), ...messages];
	nodeRepo.updateNode(topic);
};
