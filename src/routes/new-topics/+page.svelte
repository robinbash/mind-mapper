<script lang="ts">
	import { mindmap } from '$lib/stores';
	import { Breadcrumbs } from '$lib/components';
	$: rootTopics = $mindmap.filter((node) => !node.parentId).filter((node) => node.type === 'topic');
</script>

<!-- <Breadcrumbs /> -->
<div class="flex w-full items-center">
	<button
		class="flex justify-center items-center h-full relative font-bold text-base w-full px-6 py-5"
	>
		<span class="iconify w-5 h-5 mdi--new-releases mr-2" />
		New prompts
	</button>
</div>
<div class="container">
	{#each rootTopics as topic}
		<a href={`/topics/${topic.id}`} class="btn btn-lg w-full font-normal text-base rounded-md">
			{topic.title}
		</a>
	{/each}
</div>

<style>
	.container {
		@apply flex flex-col min-w-full max-h-full h-full gap-4 w-full overflow-y-scroll mt-4;
	}
</style>
