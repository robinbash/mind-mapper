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
	$: pathLen = paths?.nodes?.length ?? 0;
	let showAll: boolean;
	$: showAll = pathLen < 3 && (!isDetails || pathLen < 2);
</script>

<div class="breadcrumbs max-w-full text-sm pb-6 font-sans">
	<ul>
		<li><a href="/"><span class="iconify mdi--home h-6 w-6" /></a></li>
		<li>
			<div class={`badge badge-sm text-white p-2 ${category?.background}`}>
				<a href={`/${category?.id}`} class="flex items-center">{category?.title}</a>
			</div>
		</li>
		{#if showAll}
			{#each paths?.nodes ?? [] as path}
				<li>
					<a href={`/${path.id}`} class="flex items-center"
						><span class="max-w-20 truncate">{path.title}</span></a
					>
				</li>
			{/each}
		{:else}
			<li>
				<button
					on:click={() => {
						showAll = true;
					}}
				>
					...
				</button>
			</li>
			<li>
				<a href={`/${paths?.nodes.at(-1)?.id}`} class="flex items-center"
					><span class="max-w-20 truncate">{paths?.nodes.at(-1)?.title}</span></a
				>
			</li>
		{/if}

		{#if isDetails}
			<li>Details</li>{/if}
	</ul>
</div>
