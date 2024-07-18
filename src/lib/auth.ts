import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const login = async (email: string, password: string) => {
	await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error('Error logging out:', error);
	}
};
