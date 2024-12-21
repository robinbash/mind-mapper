import { writable } from 'svelte/store';
import { user } from '$lib/stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import type { Message } from '$lib/types';

import { authFetch, handleAIResponse } from '$lib/fetch';

type ChatData = {
	messages: Message[];
	state: 'initial' | 'finishable' | 'finishing';
	currentAiResponse: string;
	aiResponseLoading: boolean;
};

export type ChatStore = {
	subscribe: (run: (value: ChatData) => void, invalidate?: any) => () => void;
	reset: () => void;
	submitPrompt: (prompt: string) => void;
	consolidate: () => void;
	save: () => void;
	destroy: () => void;
};

const createChatStore = (): ChatStore => {
	const initial: ChatData = {
		state: 'initial',
		currentAiResponse: '',
		aiResponseLoading: false,
		messages: []
	};
	const chatStore = writable<ChatData>({ ...initial });
	const { subscribe, set, update } = chatStore;

	let eventSource: EventSource;

	const reset = () => {
		set(initial);
	};

	const addResponseChunk = (chunk: string) =>
		update((store) => ({ ...store, currentAiResponse: store.currentAiResponse + chunk }));

	const checkReload = () => {
		const lastMessage = get(chatStore).messages.at(-1);
		if (lastMessage?.role !== 'assistant') return;

		update((store) => ({
			...store,
			messages: store.messages.slice(0, -1)
		}));
	};

	const submitPrompt = async (prompt: string) => {
		const current = get(chatStore);
		if (current.aiResponseLoading || !get(user)) return;

		update((store) => ({
			...store,
			currentAiResponse: '',
			aiResponseLoading: true,
			messages: [...store.messages, { role: 'user', content: prompt }]
		}));

		try {
			const response = await authFetch('/api/new-topic/prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messages: get(chatStore).messages,
					prompt
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

	const save = async () => {
		update((store) => ({
			...store,
			state: 'finishing'
		}));
		let messages = get(chatStore).messages;

		const response = await authFetch(`/api/new-topic/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ messages })
		});
		const result = await response.json();
		reset();
		goto(`topics/${result.result}`, { replaceState: true });
	};

	const consolidate = () => {
		update((store) => ({
			...store,
			aiResponseLoading: false,
			currentAiResponse: '',
			messages: [
				...store.messages,
				{
					role: 'assistant',
					content: store.currentAiResponse,
					type: 'answer'
				}
			],
			state: 'finishable'
		}));
	};

	return {
		subscribe,
		reset,
		submitPrompt,
		save,
		consolidate,
		destroy: () => {}
	};
};

export const chat = createChatStore();
