<script lang="ts">
	import { mindmap } from '$lib/stores';
	import { page } from '$app/stores';
	import BreadcrumbItem from './BreadcrumbItem.svelte';
	import { type Node } from '$lib/types';

	const newTopicsPath = 'new-topics';

	export let topicId: string | undefined = undefined;
	$: topic = $mindmap.find((n) => n.id === topicId);
	const getPaths = (n?: Node) => {
		if (!n) return;
		let root = n;
		if (!topic?.parentId && topic?.type === 'topic')
			return { root, topics: [{ id: newTopicsPath, title: 'New Prompts' }] };
		let topics = [];
		while (true) {
			if (!root.parentId) break;
			const parent = $mindmap.find((n) => n.id === root.parentId);
			if (!parent) break;
			topics.unshift(parent);
			root = parent;
		}
		return { root, topics };
	};
	$: paths = getPaths(topic);
	// $: category = CATEGORIES.find((cat) => cat.id === paths?.root.id);
	$: isExpand = $page.route.id?.endsWith('/expand');
	$: isRefine = $page.route.id?.endsWith('/refine');

	$: isSubpage = isExpand || isRefine;
	$: pathLen = paths?.topics?.length ?? 0;
	let showAll: boolean = true;

	// $: showAll = pathLen < 3 && (!isSubpage || pathLen < 2);
</script>

<div
	class="flex max-w-full w-full text-xs pb-5 font-sans items-center pt-2 md:pt-2 flex-wrap gap-y-1"
>
	<a href="/" class="flex"><span class="iconify mdi--home h-6 w-6" /></a>
	<!-- <BreadcrumbItem>
		<div class={`badge badge-sm text-white p-2 ${category?.background}`}>
			<a href={`/topics/${category?.id}`} class="flex items-center">{category?.title}</a>
		</div>
	</BreadcrumbItem> -->
	{#if showAll}
		{#each paths?.topics ?? [] as path}
			<BreadcrumbItem>
				<a
					href={`${path.id === newTopicsPath ? '' : '/topics'}/${path.id}`}
					class="flex items-center"
				>
					<span class="max-w-30 truncate">{path.title}</span>
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

		<a href={`/topics/${paths?.topics.at(-1)?.id}`} class="flex items-center"
			><span class="max-w-24 truncate">{paths?.topics.at(-1)?.title}</span></a
		>
	{/if}

	<!-- {#if isExpand}
		<BreadcrumbItem>
			<span class="iconify mdi--source-branch min-w-5 min-h-5" />
		</BreadcrumbItem>
	{/if}
	{#if isRefine}
		<BreadcrumbItem>
			<span class="iconify mdi--lead-pencil min-w-5 min-h-5" />
		</BreadcrumbItem>
	{/if} -->
</div>
