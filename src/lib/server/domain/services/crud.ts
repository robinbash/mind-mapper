import { NodeRepo } from '$lib/server/nodeRepo';
import { getEmbedding } from '$lib/server/domain/ai';

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

export const addCategory: DomainService<
	{ parentId: string | null; title: string },
	string
> = async ({ title, parentId, userId }): Promise<string> => {
	const nodeRepo = new NodeRepo();
	await nodeRepo.load(userId);

	const embedding = await getEmbedding(title);

	const category = {
		parentId: parentId ?? null,
		title,
		embedding
	};

	const newTopicId = nodeRepo.addCategory(category);
	return newTopicId;
};
