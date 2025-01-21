<script lang="ts">
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import { logout } from '$lib/auth';
	import { mindmap } from '$lib/stores';
	import { AddCategoryModal } from '$lib/components';

	$: rootNodes = $mindmap.filter((node) => !node.parentId);

	$: topics = rootNodes.filter((node) => node.type === 'topic');
	$: categories = rootNodes.filter((node) => node.type === 'category');

	let categoryModalOpen = false;

	const closeCategoryModal = () => {
		categoryModalOpen = false;
	};

	onMount(() => {
		themeChange(false);
	});
</script>

<div class="absolute top-0 left-0 px-8 w-full flex mt-4 items-center justify-between">
	<button class="btn btn-md btn-circle" on:click={logout}
		><span class="iconify mdi--logout" /></button
	>
	<div>
		<button class="switcher" data-toggle-theme="dracula,emerald"
			><span class="absolute iconify mdi--theme-light-dark h-5 w-5" /></button
		>
	</div>
</div>
<div class="w-full h-full pt-20 pb-8">
	<div class="container">
		<div class="flex w-full gap-3 pb-4">
			<div class="flex w-1/2 justify-center">
				<a href="/new" class="w-full gap-1 btn btn-md font-normal text-base">
					<span class="iconify w-5 h-5 mdi--plus" />
					Prompt</a
				>
			</div>

			<div class="flex w-1/2 justify-center opacity-75">
				<button
					on:click={() => {
						categoryModalOpen = true;
					}}
					class="w-full gap-1 btn btn-md font-normal text-base btn-outline"
				>
					<span class="iconify w-5 h-5 mdi--plus" />
					Category</button
				>
			</div>
		</div>
		<div class="container">
			<a
				href="/new-topics"
				class="btn btn-lg btn-outline opacity-75 w-full font-normal text-base rounded-md"
			>
				<span class="iconify w-5 h-5 mdi--new-releases" />
				New prompts
			</a>
			{#each categories as category}
				<a
					href={`/topics/${category.id}`}
					class="relative btn btn-lg w-full font-normal text-base rounded-md btn-outline opacity-75"
				>
					{category.title}
					<span class="absolute left-3 badge badge-ghost badge-sm"
						>{mindmap.getNumSubtree(category)}</span
					>
				</a>
			{/each}
			{#each topics as topic}
				<a href={`/topics/${topic.id}`} class="btn btn-lg w-full font-normal text-base rounded-md">
					{topic.title}
				</a>
			{/each}
		</div>
	</div>
	<AddCategoryModal open={categoryModalOpen} onClose={closeCategoryModal} />
</div>

<style>
	.container {
		@apply flex flex-col min-w-full max-h-full h-full gap-4 w-full overflow-y-scroll;
	}
	.categories {
		@apply flex justify-center items-center gap-5 flex-col md:flex-row;
		font-family: 'Playwrite AT';
	}
	.switcher {
		@apply relative btn btn-md btn-circle flex;
	}
</style>
