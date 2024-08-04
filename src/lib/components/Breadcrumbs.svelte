<script lang="ts">
	import { mindmap } from '$lib/stores';
	import { CATEGORIES } from '$lib/categories';
	import type { Topic } from '$lib/types';
	import { page } from '$app/stores';
	import BreadcrumbItem from './BreadcrumbItem.svelte';

	export let topicId: string;
	$: topic = $mindmap.find((n) => n.id === topicId);
	const getPaths = (n?: Topic) => {
		if (!n) return;
		let root = n;
		let topics = [];
		while (true) {
			if (!root.parentId) break;
			const parent = $mindmap.find((n) => n.id === root.parentId);
			if (!parent) break;
			topics.unshift(root);
			root = parent;
		}
		return { root, topics };
	};
	$: paths = getPaths(topic);
	$: category = CATEGORIES.find((cat) => cat.id === paths?.root.id);
	$: isExpand = $page.route.id?.endsWith('/expand');
	$: isDevelop = $page.route.id?.endsWith('/develop');

	$: isSubpage = isExpand || isDevelop;
	$: pathLen = paths?.topics?.length ?? 0;
	let showAll: boolean = true;

	// $: showAll = pathLen < 3 && (!isSubpage || pathLen < 2);
</script>

<div class="flex max-w-full text-sm pb-6 font-sans items-center pt-2 md:pt-6 flex-wrap gap-y-1">
	<a href="/" class="flex"><span class="iconify mdi--home h-6 w-6" /></a>
	<BreadcrumbItem>
		<div class={`badge badge-sm text-white p-2 ${category?.background}`}>
			<a href={`/${category?.id}`} class="flex items-center">{category?.title}</a>
		</div>
	</BreadcrumbItem>
	{#if showAll}
		{#each paths?.topics ?? [] as path}
			<BreadcrumbItem>
				<a href={`/${path.id}`} class="flex items-center">
					<span class="max-w-28 truncate">{path.title}</span>
				</a>
			</BreadcrumbItem>
		{/each}
	{:else}
		<button
			class="flex items-center"
			on:click={() => {
				showAll = true;
			}}
		>
			<span class="iconify mdi--chevron-right min-w-5 min-h-5" />
			<span class="px-1">...</span>
			<span class="iconify mdi--chevron-right min-w-5 min-h-5" />
		</button>

		<a href={`/${paths?.topics.at(-1)?.id}`} class="flex items-center"
			><span class="max-w-24 truncate">{paths?.topics.at(-1)?.title}</span></a
		>
	{/if}

	{#if isExpand}
		<BreadcrumbItem>
			<span class="iconify mdi--source-branch min-w-5 min-h-5" />
		</BreadcrumbItem>
	{/if}
	{#if isDevelop}
		<BreadcrumbItem>
			<span class="iconify mdi--lead-pencil min-w-5 min-h-5" />
		</BreadcrumbItem>
	{/if}
</div>
