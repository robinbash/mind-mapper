export type MessageRole = 'assistant' | 'user';
export type Message = {
	role: MessageRole;
	content: string;
};
export type Refinement = {
	messages: Message[];
	newDescription: string;
};

export type Expansion = {
	messages: Message[];
};

export type Topic = {
	id: string;
	title: string;
	description: string;
	parentId?: string;
	refinements?: Refinement[];
	expansions?: Expansion[];
};
