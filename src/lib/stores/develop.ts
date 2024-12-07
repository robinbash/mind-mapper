import { writable } from 'svelte/store';
import { user } from '$lib/stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

import type { DevelopmentInProgress, DevelopmentType, AIHelpType } from '$lib/types';

import { authFetch, handleAIResponse } from '$lib/fetch';

type DevelopmentData = DevelopmentInProgress & {
	state: 'initial' | 'finishable' | 'finishing';
	currentAiResponse: string;
	aiResponseLoading: boolean;
};

export type DevelopmentStore = {
	subscribe: (run: (value: DevelopmentData) => void, invalidate?: any) => () => void;
	reset: () => void;
	ignore: () => void;
	submitPrompt: (topicId: string, prompt: string) => void;
	generate: (topicId: string) => void;
	acceptSuggestion: (topicId: string) => void;
	finish: (topicId: string) => void;
	destroy: () => void;
	setGuide: () => void;
	setTell: () => void;
	toggleMode: () => void;
};

const createDevelopStore = (developmentType: DevelopmentType): DevelopmentStore => {
	const initial: DevelopmentData = {
		state: 'initial',
		mode: 'initial',
		currentAiResponse: '',
		aiResponseLoading: false,
		previousQuestions: [],
		previousSuggestions: [],
		messages: [],
		type: developmentType
	};
	const devStore = writable<DevelopmentData>({ ...initial });
	const { subscribe, set, update } = devStore;

	let unsubscribe: () => void;

	let eventSource: EventSource;

	const reset = () => {
		set(initial);
	};

	const setGuide = () =>
		update((store) => ({
			...store,
			mode: 'guide'
		}));

	const setTell = () =>
		update((store) => ({
			...store,
			mode: 'tell'
		}));

	const toggleMode = () => {
		update((store) => ({
			...store,
			mode: store.mode === 'guide' ? 'tell' : 'guide',
			currentAiResponse: ''
		}));
	};

	const addResponseChunk = (chunk: string) =>
		update((store) => ({ ...store, currentAiResponse: store.currentAiResponse + chunk }));

	const checkReload = () => {
		const lastMessage = get(devStore).messages.at(-1);
		if (lastMessage?.role !== 'assistant') return;

		update((store) => ({
			...store,
			messages: store.messages.slice(0, -1),
			previousQuestions:
				lastMessage.type === 'question'
					? [...store.previousQuestions, lastMessage.content ?? '']
					: store.previousQuestions,
			previousSuggestions:
				lastMessage.type === 'suggestion'
					? [...store.previousQuestions, lastMessage.content ?? '']
					: store.previousQuestions
		}));
	};

	const getAIHelp = async (type: AIHelpType, topicId: string) => {
		if (!get(user)) return;
		let responseText: string;

		checkReload();

		update((store) => ({
			...store,
			aiResponseLoading: true,
			currentAiResponse: ''
		}));

		try {
			if (eventSource) {
				eventSource.close();
			}
			const response = await authFetch(`/api/develop/${type}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topicId: topicId,
					development: get(devStore)
				})
			});
			responseText = await handleAIResponse(response, addResponseChunk);
		} catch (err) {
			console.error(err);
			update((store) => ({
				...store,
				aiResponseLoading: false,
				currentAiResponse: ''
			}));
			return;
		}
		if (responseText) {
			update((store) => ({
				...store,
				messages: [
					...store.messages,
					{ role: 'assistant', content: store.currentAiResponse, type }
				],
				aiResponseLoading: false
			}));
		}
	};

	const generate = (topicId: string) => {
		const mode = get(devStore).mode;
		if (mode === 'guide') {
			getAIHelp('question', topicId);
		}
		if (mode === 'tell') {
			getAIHelp('suggestion', topicId);
		}
	};

	const acceptSuggestion = async (topicId: string) => {
		const lastMessage = get(devStore).messages.at(-1);

		if (!get(user) || lastMessage?.role !== 'assistant' || lastMessage.type !== 'suggestion')
			return;

		submitPrompt(topicId, 'Accept');
	};

	const submitPrompt = async (topicId: string, prompt: string) => {
		const current = get(devStore);
		if (current.aiResponseLoading || current.mode === 'initial' || !get(user)) return;

		update((store) => ({
			...store,
			currentAiResponse: '',
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
					development: get(devStore),
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
						content: store.currentAiResponse,
						type: store.mode === 'guide' ? 'question' : 'suggestion'
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
		let messages = get(devStore).messages;
		if (messages.at(-1)?.role === 'assistant') messages.pop();

		const response = await authFetch(`/api/develop/finish`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ topicId: topicId, development: get(devStore) })
		});
		const result = await response.json();
		reset();
		goto(`/${result.result}`, { replaceState: true });
	};

	const ignore = async () => {
		checkReload();
		update((store) => ({
			...store,
			currentAiResponse: '',
			aiResponseLoading: false
		}));
	};

	return {
		subscribe,
		reset,
		submitPrompt,
		generate,
		acceptSuggestion,
		finish,
		setGuide,
		toggleMode,
		setTell,
		ignore,
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

export const refine = createDevelopStore('refinement');
export const expand = createDevelopStore('expansion');
