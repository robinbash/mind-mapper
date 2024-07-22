<script lang="ts">
	import { mindmap } from '$lib/stores';
	import { CATEGORIES } from '$lib/categories';
	import type { MindNode } from '$lib/types';
	import { page } from '$app/stores';

	export let nodeId: string;
	$: node = $mindmap.find((n) => n.id === nodeId);
	const getPaths = (n?: MindNode) => {
		if (!n) return;
		let root = n;
		let nodes = [];
		while (true) {
			if (!root.parentId) break;
			const parent = $mindmap.find((n) => n.id === root.parentId);
			if (!parent) break;
			nodes.unshift(root);
			root = parent;
		}
		return { root, nodes };
	};
	$: paths = getPaths(node);
	$: category = CATEGORIES.find((cat) => cat.id === paths?.root.id);
	$: isDetails = $page.route.id?.endsWith('/details');
	$: isDevelop = $page.route.id?.endsWith('/develop');

	$: isSubpage = isDetails || isDevelop;
	$: pathLen = paths?.nodes?.length ?? 0;
	let showAll: boolean;
	$: showAll = pathLen < 3 && (!isSubpage || pathLen < 2);
</script>

<div class="flex max-w-full text-sm pb-6 font-sans items-center overflow-x-scroll">
	<a href="/" class="flex"><span class="iconify mdi--home h-6 w-6" /></a>
	<span class="iconify mdi--chevron-right min-w-5 min-h-5" />
	<div class={`badge badge-sm text-white p-2 ${category?.background}`}>
		<a href={`/${category?.id}`} class="flex items-center">{category?.title}</a>
	</div>
	{#if showAll}
		{#each paths?.nodes ?? [] as path}
			<span class="iconify mdi--chevron-right min-w-5 min-h-5" />

			<a href={`/${path.id}`} class="flex items-center"
				><span class="max-w-24 truncate">{path.title}</span></a
			>
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

		<a href={`/${paths?.nodes.at(-1)?.id}`} class="flex items-center"
			><span class="max-w-24 truncate">{paths?.nodes.at(-1)?.title}</span></a
		>
	{/if}

	{#if isDetails}
		<span class="iconify mdi--chevron-right min-w-5 min-h-5" />
		<span class="iconify mdi--drive-document min-w-5 min-h-5" />{/if}
	{#if isDevelop}
		<span class="iconify mdi--chevron-right min-w-5 min-h-5" />
		<span class="iconify mdi--lead-pencil min-w-5 min-h-5" />{/if}
</div>
