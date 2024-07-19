<script lang="ts">
	import { Breadcrumbs } from '$lib/components';
	import { mindmap } from '$lib/stores';
	import { goto } from '$app/navigation';

	export let nodeId: string;

	$: node = $mindmap.find((n) => n.id === nodeId);
	$: children = $mindmap.filter((n) => n.parentId === nodeId);

	$: if (node && !children.length) {
		goto(`/${node.id}/details`, { replaceState: true });
	}
</script>

<div class="container">
	<div class="md:w-[40rem] w-full h-full p-5">
		<Breadcrumbs {nodeId} />
		<a
			href={`${nodeId}/details`}
			class="btn btn-lg btn-outline w-full font-normal text-base border-slate-400 relative"
		>
			<span class="absolute left-3 iconify mdi--drive-document mr-1 w-5 h-5" />{node?.title}
		</a>
		<div class="flex justify-center pt-4 flex-col gap-4">
			{#each children as child}
				<a href={`/${child.id}`} class="btn btn-lg w-full font-normal text-base">
					{child.title}
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
</style>
