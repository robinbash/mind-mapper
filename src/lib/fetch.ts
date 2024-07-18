import { auth } from '$lib/firebase';

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
