<script lang="ts">
	import { mindmap } from '$lib/stores';
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
<div class="flex justify-center flex-col gap-4 pt-4 pb-6">
	{#each childCategories as childCategory}
		<a
			href={`/topics/${childCategory.id}`}
			class="flex h-auto btn btn-lg w-full font-normal text-base overflow-hidden rounded-md opcaity-75 button-outline"
		>
			{childCategory.title}
		</a>
	{/each}
	{#each childTopics as childTopic}
		<a
			href={`/topics/${childTopic.id}`}
			class="flex h-auto btn btn-lg w-full font-normal text-base overflow-hidden rounded-md"
		>
			{childTopic.title}
		</a>
	{/each}

	<button class="btn btn-lg text-opacity-65 w-full font-normal text-base gap-1 rounded-md">
		<span class="iconify mdi--add w-5 h-5" />Add Subtopic
	</button>
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
