export type MessageRole = 'assistant' | 'user';
export type Message = {
	role: MessageRole;
	content: string;
};
export type Development = {
	messages: Message[];
};

export type Expansion = {
	messages: Message[];
};

export type Topic = {
	id: string;
	title: string;
	description: string;
	parentId?: string;
	developments?: Development[];
	expansions?: Expansion[];
};

export type ExpandTopic = (topic: Topic, expansion: Expansion) => Topic[];
export type DevelopTopic = (topic: Topic, development: Development) => Topic;
