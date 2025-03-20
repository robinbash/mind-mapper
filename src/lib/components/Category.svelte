<script lang="ts">
	import { mindmap } from '$lib/stores';
	import { TopicActionsDropdown } from '$lib/components';
	import { register } from 'swiper/element/bundle';
	import { onMount } from 'svelte';
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';
	import type { Category } from '$lib/types';

	onMount(() => {
		register();
	});

	export let category: Category;
	$: children = $mindmap.filter((n) => n.parentId === category.id);
	$: childTopics = children.filter((n) => n.type === 'topic');
	$: childCategories = children.filter((n) => n.type === 'category');
</script>

<div class="flex w-full items-center">
	<button class="flex h-full relative font-bold text-base w-full px-6 py-5">
		<span class="w-full">{category.title}</span>
	</button>
</div>
<div class="container mt-1 mb-12">
	<div class="border-b opacity-75" />
	{#each childCategories as childCategory}
		<div class="border-b opacity-75" />
		<a
			href={`/topics/${childCategory.id}`}
			class="relative flex h-auto btn btn-lg w-full font-normal text-base overflow-hidden rounded-md opacity-75 btn-ghost"
		>
			{childCategory.title}
			<span class="absolute left-3 badge badge-ghost badge-sm"
				>{mindmap.getNumSubtree(childCategory)}</span
			>
		</a>
	{/each}
	{#each childTopics as childTopic}
		<div class="border-b opacity-75" />
		<a
			href={`/topics/${childTopic.id}`}
			class="flex h-auto btn btn-lg btn-ghost w-full font-normal text-base overflow-hidden rounded-md"
		>
			{childTopic.title}
		</a>
	{/each}

	<button class="btn btn-lg text-opacity-65 w-full font-normal text-base gap-1 rounded-md mt-1">
		<span class="iconify mdi--add w-5 h-5" />Add Subtopic
	</button>
</div>
<div class="absolute flex bottom-6 right-2">
	<TopicActionsDropdown topic={category} setLoading={(value) => {}} />
</div>

<style>
	.container {
		@apply flex flex-col min-w-full max-h-full h-full gap-1 w-full overflow-y-scroll;
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
	swiper-container {
		width: 100%;
		height: 100vh;
		display: block; /* This can help with visibility */
	}

	.slide-content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: #f4f4f4;
	}

	.loading {
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
