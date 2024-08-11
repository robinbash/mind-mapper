<script lang="ts">
	import { Breadcrumbs, TopicActionsDropdown } from '$lib/components';
	import { mindmap } from '$lib/stores';

	export let topicId: string;
	let expanded = false;
	let scrolledToTop = true;
	let scrolledToBottom = true;

	let descriptionEl: HTMLSpanElement;

	$: topic = $mindmap.find((n) => n.id === topicId);
	$: children = $mindmap.filter((n) => n.parentId === topicId);
	$: isRoot = topic?.parentId === undefined;

	$: if (topic && topicId) {
		expanded = children.length === 0 && !isRoot;
	}

	$: {
		if (descriptionEl) {
			checkScroll();
		}
	}

	const checkScroll = () => {
		if (!descriptionEl) return;
		scrolledToBottom =
			descriptionEl.scrollHeight - descriptionEl.scrollTop < descriptionEl.clientHeight + 3;
		scrolledToTop = descriptionEl.scrollTop <= 0;
	};
</script>

<div class="container">
	<div class="flex flex-col md:w-[44rem] w-full h-full p-5">
		<Breadcrumbs {topicId} />
		<div class="flex w-full items-center">
			<button
				class="flex h-full relative font-bold text-base btn btn-lg btn-outline w-full rounded-btn px-9 py-2"
				on:click={() => {
					expanded = !expanded;
				}}
			>
				<div class="absolute left-2 flex w-9 items-center">
					<span
						class="iconify mdi--chevron-right w-5 h-5 transition-all"
						class:rotate-90={expanded}
					/>
				</div>
				<span class="w-full">{topic?.title}</span>
			</button>
		</div>
		{#if expanded}
			<span
				class="flex max-h-full w-full opacity-65 overflow-y-scroll my-6"
				on:scroll={() => {
					checkScroll();
				}}
				bind:this={descriptionEl}
				class:shadow-both={!scrolledToTop && !scrolledToBottom}
				class:shadow-top={scrolledToTop && !scrolledToBottom}
				class:shadow-bottom={!scrolledToTop && scrolledToBottom}
			>
				{topic?.description}
			</span>
			{#if !isRoot}
				<div class="w-full flex pb-8 justify-center gap-4">
					<a class="btn btn-sm" href={`/${topicId}/refine`}
						><span class="iconify mdi--lead-pencil" /> Refine</a
					>
					<!-- <button class="btn btn-sm"
						><span class="iconify mdi--format-page-split w-5 h-5" /> Split</button
					> -->
					<TopicActionsDropdown {topic} />
				</div>
			{/if}
		{/if}
		{#if !expanded}
			<div class="flex justify-center flex-col gap-4 pt-4">
				{#each children as child}
					<a
						href={`/${child.id}`}
						class="flex h-auto btn btn-lg w-full font-normal text-base overflow-hidden py-2"
					>
						{child.title}
					</a>
				{/each}

				<a
					href={`/${topicId}/expand`}
					class="btn btn-lg text-opacity-65 w-full font-normal text-base gap-1"
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
	.shadow-both {
		box-shadow:
			inset 0px -8px 5px -5px rgba(0, 0, 0, 0.15),
			inset 0px 8px 5px -5px rgba(0, 0, 0, 0.15);
	}
	.shadow-bottom {
		box-shadow: inset 0px 8px 5px -5px rgba(0, 0, 0, 0.15);
	}
	.shadow-top {
		box-shadow: inset 0px -8px 5px -5px rgba(0, 0, 0, 0.15);
	}
</style>
