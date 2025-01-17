export type UserMessage = {
	role: 'user';
	content: string;
};

export type AIHelpType = 'suggestion' | 'question' | 'answer';

export type AssistantMessage = {
	role: 'assistant';
	type: AIHelpType;
	content: string;
};

export type Message = UserMessage | AssistantMessage;

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
	newSummary: string;
	type: DevelopmentType;
};

export type Topic = {
	type: 'topic';
	id: string;
	title: string;
	summary: string;
	parentId: string | null;
	messages: Message[];
	embedding: number[];
	// TODO
	// contextAware?: boolean;
	developments?: Development[];
};

export type Category = {
	type: 'category';
	id: string;
	parentId: string | null;
	title: string;
	// TODO
	// system prompt
};

export type Node = Topic | Category;
