<script lang="ts">
	import { Breadcrumbs } from '$lib/components';
	import { mindmap } from '$lib/stores';

	export let topicId: string;
	let expanded = false;

	$: topic = $mindmap.find((n) => n.id === topicId);
	$: children = $mindmap.filter((n) => n.parentId === topicId);

	$: if (topic && topicId) {
		expanded = children.length === 0;
	}
</script>

<div class="container">
	<div class="md:w-[46rem] w-full h-full p-5">
		<Breadcrumbs {topicId} />
		<div class="flex w-full items-center">
			<button
				class="font-bold text-base py-3 w-full flex"
				on:click={() => {
					expanded = !expanded;
				}}
			>
				<div class="flex w-9 items-center">
					<span
						class="iconify mdi--chevron-right w-6 h-6 transition-all"
						class:rotate-90={expanded}
					/>
				</div>
				<span class="w-full">{topic?.title}</span>
			</button>
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-square btn-sm">
					<span class="iconify mdi--dots-vertical w-5 h-5" />
				</div>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content menu bg-base-200 rounded-btn z-[1] w-32 p-2 shadow"
				>
					<li><button><span class="iconify mdi--trash-can w-5 h-5 mr-1" />Delete</button></li>
					<li><button><span class="iconify mdi--history w-5 h-5 mr-1" />History</button></li>
				</ul>
			</div>
		</div>
		{#if expanded}
			<div class="flex w-full opacity-60 items-center py-3">
				{topic?.description}
			</div>
			<div class="w-full flex pt-3 justify-center gap-4">
				<a class="btn btn-sm" href={`/${topicId}/refine`}
					><span class="iconify mdi--lead-pencil" /> Refine</a
				>
				<button class="btn btn-sm"
					><span class="iconify mdi--format-page-split w-5 h-5" /> Split</button
				>
			</div>
		{/if}
		{#if !expanded}
			<div class="w-full px-1">
				<div class="border-dashed w-full border-t-2 my-4 border-base-content opacity-20" />
			</div>
			<div class="flex justify-center flex-col gap-4">
				{#each children as child}
					<a href={`/${child.id}`} class="btn btn-lg w-full font-normal text-base overflow-hidden">
						{child.title}
					</a>
				{/each}

				<a
					href={`/${topicId}/expand`}
					class="btn btn-lg text-opacity-60 w-full font-normal text-base gap-1"
				>
					<span class="iconify mdi--add w-5 h-5" />Add Subtopic
				</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
</style>
