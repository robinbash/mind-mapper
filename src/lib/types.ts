export type MindNode = {
	id: string;
	title: string;
	description: string;
	childIds?: string[];
	parentId?: string;
};
