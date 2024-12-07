import type { Message } from '$lib/types';

type ChatData = {
	messages: Message[];
	currentAiResponse: string;
	aiResponseLoading: boolean;
};

export type ChatStore = {
	subscribe: (run: (value: ChatData) => void, invalidate?: any) => () => void;
	reset: () => void;
	submitPrompt: (prompt: string) => void;
	finish: () => void;
	destroy: () => void;
};
