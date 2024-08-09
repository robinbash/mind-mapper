export type UserMessage = {
	role: 'user';
	content: string;
};

export type AssistantMessage = {
	role: 'assistant';
	type: 'suggestion' | 'question';
	content: string;
};

export type DevelopmentMessage = UserMessage | AssistantMessage;

export type Development = {
	messages: DevelopmentMessage[];
	newDescription: string;
	type: 'expansion' | 'refinement';
};

export type Topic = {
	id: string;
	title: string;
	description: string;
	parentId?: string;
	developments?: Development[];
};
