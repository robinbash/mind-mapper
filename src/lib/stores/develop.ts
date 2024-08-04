import { writable } from 'svelte/store';
import { user } from '$lib/stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

import { authFetch, handleAIResponse } from '$lib/fetch';

type Message = {
	role: 'assistant' | 'user';
	content: string;
};

type Development = {
	state: 'initial' | 'guide' | 'prompt' | 'finishing';
	currentAiRespsonse: string;
	aiResponseLoading: boolean;
	previousQuestions: string[];
	messages: Message[];
};

export type DevelopmentStore = {
	subscribe: (run: (value: Development) => void, invalidate?: any) => () => void;
	reset: () => void;
	submitPrompt: (topicId: string, prompt: string) => void;
	getGuide: (topicId: string) => void;
	finish: (topicId: string) => void;
	destroy: () => void;
};

const createDevelopStore = (endpoint: string): DevelopmentStore => {
	const initial: Development = {
		state: 'initial',
		currentAiRespsonse: '',
		aiResponseLoading: false,
		previousQuestions: [],
		messages: []
	};
	const devStore = writable<Development>(initial);
	const { subscribe, set, update } = devStore;

	let unsubscribe: () => void;

	let eventSource: EventSource;

	const reset = () => {
		set(initial);
	};

	const addResponseChunk = (chunk: string) =>
		update((store) => ({ ...store, currentAiRespsonse: store.currentAiRespsonse + chunk }));

	const getGuide = async (topicId: string) => {
		if (!get(user)) return;

		update((store) => ({
			...store,
			aiResponseLoading: true,
			currentAiRespsonse: '',
			state: 'guide'
		}));

		try {
			if (eventSource) {
				eventSource.close();
			}
			const response = await authFetch(`/api/${endpoint}/guide`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topicId: topicId,
					previousQuestions: get(devStore).previousQuestions
				})
			});
			await handleAIResponse(response, addResponseChunk);
		} finally {
			update((store) => ({
				...store,
				aiResponseLoading: false,
				messages: [...store.messages, { role: 'assistant', content: store.currentAiRespsonse }],
				previousQuestions: [...store.previousQuestions]
			}));
		}
	};

	const submitPrompt = async (topicId: string, prompt: string) => {
		if (get(devStore).aiResponseLoading || !get(user)) return;

		update((store) => ({
			...store,
			currentAiRespsonse: '',
			aiResponseLoading: true,
			state: 'prompt'
		}));

		try {
			if (eventSource) {
				eventSource.close();
			}
			const response = await authFetch(`/api/${endpoint}/prompt`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ topicId: topicId, prompt, previousMessages: get(devStore).messages })
			});
			await handleAIResponse(response, addResponseChunk);
		} finally {
			update((store) => ({
				...store,
				aiResponseLoading: false,
				messages: [
					...store.messages,
					{ role: 'user', content: prompt },
					{ role: 'assistant', content: store.currentAiRespsonse }
				]
			}));
		}
	};

	const finish = async (topicId: string) => {
		update((store) => ({
			...store,
			state: 'finishing'
		}));

		const response = await authFetch(`/api/${endpoint}/finish`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ topicId: topicId, messages: get(devStore).messages })
		});
		reset();
		goto(`/${topicId}/details`, { replaceState: true });
	};

	return {
		subscribe,
		reset,
		submitPrompt,
		getGuide,
		finish,
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

export const refine = createDevelopStore('refine');
export const expand = createDevelopStore('expand');
