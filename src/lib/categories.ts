export type Category = {
	name: string;
	href: string;
	icon?: string;
	background?: string;
};

export const CATEGORIES: Category[] = [
	{ name: 'Goals', href: '/goals', icon: 'mdi--goal', background: 'bg-rose-500' },
	{ name: 'Ideas', href: '/ideas', icon: 'mdi--head-idea', background: 'bg-indigo-500' },
	{ name: 'Discovery', href: '/discovery', icon: 'mdi--telescope', background: 'bg-teal-500' }
];
