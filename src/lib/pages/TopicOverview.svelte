<script lang="ts">
	import { Breadcrumbs } from '$lib/components';
	import { mindmap } from '$lib/stores';
	import { goto } from '$app/navigation';

	export let topicId: string;

	$: topic = $mindmap.find((n) => n.id === topicId);
	$: children = $mindmap.filter((n) => n.parentId === topicId);

	$: if (topic && !children.length) {
		goto(`/${topic.id}/details`, { replaceState: true });
	}
</script>

<div class="container">
	<div class="md:w-[40rem] w-full h-full p-5">
		<Breadcrumbs {topicId} />
		<a
			href={`${topicId}/details`}
			class="btn btn-lg btn-outline w-full font-normal text-base relative"
		>
			<span class="absolute left-3 iconify mdi--drive-document mr-1 w-5 h-5" />{topic?.title}
		</a>
		<div class="w-full px-1">
			<div class="border-dashed w-full border-t-2 my-4 border-base-content opacity-30" />
		</div>
		<div class="flex justify-center flex-col gap-4">
			{#each children as child}
				<a href={`/${child.id}`} class="btn btn-lg w-full font-normal text-base overflow-hidden">
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
