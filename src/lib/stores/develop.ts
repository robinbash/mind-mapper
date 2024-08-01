import { writable } from 'svelte/store';
import { user } from '$lib/stores';
import { get } from 'svelte/store';

import { authFetch, handleAIResponse } from '$lib/fetch';

type Message = {
	role: 'assistant' | 'user';
	content: string;
};

type Development = {
	state: 'initial' | 'guide' | 'prompt';
	currentAiRespsonse: string;
	aiResponseLoading: boolean;
	previousQuestions: string[];
	messages: Message[];
};

function createDevelopStore() {
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

	const getGuide = async (nodeId: string) => {
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
			const response = await authFetch('/api/develop/guide', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topicId: nodeId,
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

	const submitPrompt = async (nodeId: string, prompt: string) => {
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
			const response = await authFetch('/api/develop/prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ topicId: nodeId, prompt })
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

	const finish = async (nodeId: string) => {
		const response = await authFetch('/api/develop/finish', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ topicId: nodeId, messages: get(devStore).messages })
		});
		console.log(response.ok);
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
}

export const develop = createDevelopStore();
