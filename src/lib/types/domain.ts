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
export type DevelopmentType = 'expansion' | 'refinement';

export type DevelopmentInProgress = {
	mode: 'initial' | 'guide' | 'tell';
	previousQuestions: string[];
	previousSuggestions: string[];
	messages: DevelopmentMessage[];
	type: DevelopmentType;
};

export type Development = {
	messages: DevelopmentMessage[];
	newDescription: string;
	type: DevelopmentType;
};

export type Topic = {
	id: string;
	title: string;
	description: string;
	parentId?: string;
	developments?: Development[];
};
