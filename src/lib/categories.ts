import type { MindNode } from './types';

export type Category = {
	icon: string;
	background: string;
} & Omit<MindNode, 'description'>;

export const CATEGORIES: Category[] = [
	{ title: 'Goals', id: 'goals', icon: 'mdi--goal', background: 'bg-rose-500' },
	{ title: 'Ideas', id: 'ideas', icon: 'mdi--head-idea', background: 'bg-indigo-500' },
	{ title: 'Discovery', id: 'discovery', icon: 'mdi--telescope', background: 'bg-teal-500' }
];
