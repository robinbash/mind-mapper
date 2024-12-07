import { writable } from 'svelte/store';
import { user } from '$lib/stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import type { Message } from '$lib/types';

import { authFetch, handleAIResponse } from '$lib/fetch';

type ChatData = {
	messages: Message[];
	state: 'initial' | 'finishable' | 'finishing';
	currentAiRespsonse: string;
	aiResponseLoading: boolean;
};

export type ChatStore = {
	subscribe: (run: (value: ChatData) => void, invalidate?: any) => () => void;
	reset: () => void;
	submitPrompt: (topicId: string, prompt: string) => void;
	finish: () => void;
	destroy: () => void;
};

const createChatStore = (): ChatStore => {
	const initial: ChatData = {
		state: 'initial',
		currentAiRespsonse: '',
		aiResponseLoading: false,
		messages: []
	};
	const chatStore = writable<ChatData>({ ...initial });
	const { subscribe, set, update } = chatStore;

	let unsubscribe: () => void;

	let eventSource: EventSource;

	const reset = () => {
		set(initial);
	};

	const addResponseChunk = (chunk: string) =>
		update((store) => ({ ...store, currentAiRespsonse: store.currentAiRespsonse + chunk }));

	const checkReload = () => {
		const lastMessage = get(chatStore).messages.at(-1);
		if (lastMessage?.role !== 'assistant') return;

		update((store) => ({
			...store,
			messages: store.messages.slice(0, -1)
		}));
	};

	const submitPrompt = async (topicId: string, prompt: string) => {
		const current = get(chatStore);
		if (current.aiResponseLoading || !get(user)) return;

		update((store) => ({
			...store,
			currentAiRespsonse: '',
			aiResponseLoading: true
		}));

		try {
			if (eventSource) {
				eventSource.close();
			}
			const response = await authFetch('/api/develop/prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topicId: topicId,
					chat: get(chatStore),
					prompt
				})
			});
			await handleAIResponse(response, addResponseChunk);
		} finally {
			update((store) => ({
				...store,
				aiResponseLoading: false,
				messages: [
					...store.messages,
					{ role: 'user', content: prompt },
					{
						role: 'assistant',
						content: store.currentAiRespsonse,
						type: 'answer'
					}
				],
				state: 'finishable'
			}));
		}
	};

	const finish = async (topicId: string) => {
		update((store) => ({
			...store,
			state: 'finishing'
		}));
		let messages = get(chatStore).messages;
		if (messages.at(-1)?.role === 'assistant') messages.pop();

		const response = await authFetch(`/api/develop/finish`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ topicId: topicId, chat: get(chatStore) })
		});
		const result = await response.json();
		reset();
		goto(`/${result.result}`, { replaceState: true });
	};

	return {
		subscribe,
		reset,
		submitPrompt,
		// generate,
		finish: () => {},
		destroy: () => {
			if (unsubscribe) {
				unsubscribe();
			}
			if (eventSource) {
				eventSource.close();
			}
		}
	};
};

export const chat = createChatStore();
