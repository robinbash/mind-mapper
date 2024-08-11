import { auth } from '$lib/firebase';
import { type Writable, get } from 'svelte/store';

export const authFetch = async (
	input: string | URL | Request,
	init?: RequestInit
): Promise<Response> => {
	const user = auth.currentUser;
	if (!user) {
		throw new Error('User not logged in');
	}
	const token = await user.getIdToken();
	return fetch(input, {
		...init,
		headers: { ...init?.headers, Authorization: `Bearer ${token}` }
	});
};

export const handleAIResponse = async (response: Response, addChunk: (chunk: string) => void) => {
	let responseText = '';
	if (response.ok) {
		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error('Failed to get reader from response');
		}
		const decoder = new TextDecoder();
		while (true) {
			const { done, value } = await reader?.read();
			if (done) return responseText;
			const chunk = decoder.decode(value);
			responseText += chunk;
			addChunk(chunk);
		}
	}
	throw new Error('Response not ok');
};
