import { writable } from 'svelte/store';

export const developState = writable<'initial' | 'lead' | 'prompt'>('initial');
export const aiResponse = writable('');
export const aiResponseLoading = writable(false);
export const userResponse = writable('');
export const resetDevelop = () => {
	developState.set('initial');
	aiResponse.set('');
	aiResponseLoading.set(false);
	userResponse.set('');
};
