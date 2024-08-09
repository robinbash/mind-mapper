import { writable } from 'svelte/store';
import { user } from '$lib/stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

import type { DevelopmentMessage } from '$lib/types';

import { authFetch, handleAIResponse } from '$lib/fetch';

type Development = {
	mode: 'initial' | 'guide' | 'tell';
	state: 'initial' | 'finishable' | 'finishing';
	currentAiRespsonse: string;
	aiResponseLoading: boolean;
	previousQuestions: string[];
	previousSuggestions: string[];
	messages: DevelopmentMessage[];
};

export type DevelopmentStore = {
	subscribe: (run: (value: Development) => void, invalidate?: any) => () => void;
	reset: () => void;
	submitPrompt: (topicId: string, prompt: string) => void;
	generate: (topicId: string) => void;
	acceptSuggestion: (topicId: string) => void;
	finish: (topicId: string) => void;
	destroy: () => void;
	setGuide: () => void;
	setTell: () => void;
	toggleState: () => void;
};

const createDevelopStore = (endpoint: string): DevelopmentStore => {
	const initial: Development = {
		state: 'initial',
		mode: 'initial',
		currentAiRespsonse: '',
		aiResponseLoading: false,
		previousQuestions: [],
		previousSuggestions: [],
		messages: []
	};
	const devStore = writable<Development>(initial);
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

	const toggleState = () => {
		update((store) => ({
			...store,
			mode: store.mode === 'guide' ? 'tell' : 'guide',
			currentAiRespsonse: ''
		}));
	};

	const addResponseChunk = (chunk: string) =>
		update((store) => ({ ...store, currentAiRespsonse: store.currentAiRespsonse + chunk }));

	const getGuide = async (topicId: string) => {
		if (!get(user)) return;
		let responseText: string;

		update((store) => ({
			...store,
			aiResponseLoading: true,
			currentAiRespsonse: ''
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
			responseText = await handleAIResponse(response, addResponseChunk);
		} catch (err) {
			console.error(err);
			update((store) => ({
				...store,
				aiResponseLoading: false,
				currentAiRespsonse: ''
			}));
			return;
		}
		const isReload = get(devStore).messages.at(-1)?.role === 'assistant';
		if (responseText) {
			update((store) => ({
				...store,
				messages: [
					...(isReload ? store.messages.slice(0, -1) : store.messages),
					{ role: 'assistant', content: store.currentAiRespsonse, type: 'question' }
				],
				aiResponseLoading: false,
				previousQuestions: responseText
					? [...store.previousQuestions, responseText]
					: store.previousQuestions
			}));
		}
	};

	const getSuggestion = async (topicId: string) => {
		if (!get(user)) return;
		let responseText: string;

		update((store) => ({
			...store,
			aiResponseLoading: true,
			currentAiRespsonse: ''
		}));

		try {
			if (eventSource) {
				eventSource.close();
			}
			const response = await authFetch(`/api/${endpoint}/suggest`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topicId: topicId,
					previousSuggestions: get(devStore).previousSuggestions
				})
			});
			responseText = await handleAIResponse(response, addResponseChunk);
		} catch (err) {
			console.error(err);
			update((store) => ({
				...store,
				aiResponseLoading: false,
				currentAiRespsonse: ''
			}));
			return;
		}
		const isReload = get(devStore).messages.at(-1)?.role === 'assistant';
		if (responseText) {
			update((store) => ({
				...store,
				messages: [
					...(isReload ? store.messages.slice(0, -1) : store.messages),
					{ role: 'assistant', content: store.currentAiRespsonse, type: 'suggestion' }
				],
				aiResponseLoading: false,
				previousQuestions: responseText
					? [...store.previousQuestions, responseText]
					: store.previousQuestions
			}));
		}
	};

	const generate = (topicId: string) => {
		const mode = get(devStore).mode;
		if (mode === 'guide') {
			getGuide(topicId);
		}
		if (mode === 'tell') {
			getSuggestion(topicId);
		}
	};

	const acceptSuggestion = async (topicId: string) => {
		if (!get(user)) return;
		let responseText: string;

		update((store) => ({
			...store,
			aiResponseLoading: true,
			currentAiRespsonse: ''
		}));

		try {
			if (eventSource) {
				eventSource.close();
			}
			const response = await authFetch(`/api/${endpoint}/accept-suggestion`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topicId: topicId,
					previousSuggestions: get(devStore).previousSuggestions
				})
			});
			responseText = await handleAIResponse(response, addResponseChunk);
		} catch (err) {
			console.error(err);
			update((store) => ({
				...store,
				aiResponseLoading: false,
				currentAiRespsonse: ''
			}));
			return;
		}
		const isReload = get(devStore).messages.at(-1)?.role === 'assistant';
		if (responseText) {
			update((store) => ({
				...store,
				messages: [
					...(isReload ? store.messages.slice(0, -1) : store.messages),
					{ role: 'assistant', content: store.currentAiRespsonse, type: 'suggestion' }
				],
				aiResponseLoading: false,
				previousQuestions: responseText
					? [...store.previousQuestions, responseText]
					: store.previousQuestions
			}));
		}
	};

	const submitPrompt = async (topicId: string, prompt: string) => {
		const current = get(devStore);
		if (current.aiResponseLoading || current.mode === 'initial' || !get(user)) return;

		update((store) => ({
			...store,
			currentAiRespsonse: '',
			aiResponseLoading: true,
			state: 'finishable'
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
				body: JSON.stringify({ topicId: topicId, prompt, previousMessages: current.messages })
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
						type: store.mode === 'guide' ? 'question' : 'suggestion'
					}
				]
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

		const response = await authFetch(`/api/${endpoint}/finish`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ topicId: topicId, messages })
		});
		const result = await response.json();
		reset();
		goto(`/${result.result}`, { replaceState: true });
	};

	return {
		subscribe,
		reset,
		submitPrompt,
		generate,
		acceptSuggestion,
		finish,
		setGuide,
		toggleState,
		setTell,
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
