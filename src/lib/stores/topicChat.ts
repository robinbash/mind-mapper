import { writable } from 'svelte/store';
import { user } from '$lib/stores';
import { get } from 'svelte/store';
import type { Message } from '$lib/types';

import { authFetch, handleAIResponse } from '$lib/fetch';

type TopicChatData = {
	currentAiResponse: string;
	currentPrompt: string;
	aiResponseLoading: boolean;
};

export type TopicChatStore = {
	subscribe: (run: (value: TopicChatData) => void, invalidate?: any) => () => void;
	reset: () => void;
	submitPrompt: (topicId: string, prompt: string, messages: Message[]) => void;
	consolidate: (topicId: string) => void;
	destroy: () => void;
};

const createTopicChatStore = (): TopicChatStore => {
	const initial: TopicChatData = {
		currentAiResponse: '',
		currentPrompt: '',
		aiResponseLoading: false
	};
	const topicChatStore = writable<TopicChatData>({ ...initial });
	const { subscribe, set, update } = topicChatStore;

	const reset = () => {
		set(initial);
	};

	const addResponseChunk = (chunk: string) =>
		update((store) => ({ ...store, currentAiResponse: store.currentAiResponse + chunk }));

	const submitPrompt = async (topicId: string, prompt: string, messages: Message[]) => {
		const current = get(topicChatStore);
		if (current.aiResponseLoading || !get(user)) return;

		update((store) => ({
			...store,
			currentAiResponse: '',
			currentPrompt: prompt,
			aiResponseLoading: true
		}));

		try {
			console.log('submitPrompt', topicId, prompt, messages);
			const response = await authFetch('/api/prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topicId,
					prompt,
					messages
				})
			});
			await handleAIResponse(response, addResponseChunk);
		} finally {
			update((store) => ({
				...store,
				aiResponseLoading: false
			}));
		}
	};

	const consolidate = async (topicId: string) => {
		const { currentPrompt, currentAiResponse } = get(topicChatStore);
		update((store) => ({
			...store,
			currentPrompt: '',
			currentAiResponse: ''
		}));

		const newMessages = [
			{ role: 'user', content: currentPrompt },
			{ role: 'assistant', content: currentAiResponse }
		];
		await authFetch('/api/add-messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				topicId,
				messages: newMessages
			})
		});
	};

	return {
		subscribe,
		reset,
		submitPrompt,
		consolidate,
		destroy: () => {}
	};
};

export const topicChat = createTopicChatStore();
