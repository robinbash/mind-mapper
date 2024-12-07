import type { Topic } from './types';

export type Category = {
	icon: string;
	background: string;
} & Omit<Topic, 'description' | 'messages'>;

export const CATEGORIES: Category[] = [
	{ title: 'Goals', id: 'goals', icon: 'mdi--goal', background: 'bg-rose-500' },
	{ title: 'Ideas', id: 'ideas', icon: 'mdi--head-idea', background: 'bg-indigo-500' },
	{ title: 'Discovery', id: 'discovery', icon: 'mdi--telescope', background: 'bg-teal-500' }
];

export type RootTopicId = 'goals' | 'ideas' | 'discovery';

export const ROOT_TOPICS: (Topic & { id: RootTopicId })[] = [
	{
		id: 'goals',
		title: 'Goals',
		description:
			'Everything I want to have done at some point in my life, be it in the near or far future.',
		messages: []
	},
	{
		id: 'ideas',
		title: 'Ideas',
		description: 'Thoughts I have had that might grow into something great.',
		messages: []
	},
	{
		id: 'discovery',
		title: 'Discovery',
		description: 'Journeys to learn about my own mind and anything beyond.',
		messages: []
	}
];
