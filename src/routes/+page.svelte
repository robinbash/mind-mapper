<script lang="ts">
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import { logout } from '$lib/auth';
	import { mindmap } from '$lib/stores';
	import { AddCategoryModal } from '$lib/components';

	$: nodes = $mindmap.filter((node) => !node.parentId);

	$: categories = nodes.filter((node) => node.type === 'category');

	$: topics = nodes.filter((node) => node.type === 'topic');

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
			{#if categories.length > 0}
				<a
					href="/new-topics"
					class="relative btn btn-lg btn-ghost opacity-75 w-full font-normal text-base rounded-md"
				>
					<span class="iconify w-5 h-5 mdi--new-releases" />
					<span class="absolute left-3 badge badge-ghost badge-sm"
						>{mindmap.getNumChildren(null)}</span
					>
					New prompts
				</a>
				{#each categories as category}
					<div class="border-b opacity-75" />
					<a
						href={`/topics/${category.id}`}
						class="relative btn btn-lg w-full font-normal text-base rounded-md btn-ghost opacity-75"
					>
						{category.title}
						<span class="absolute left-3 badge badge-ghost badge-sm"
							>{mindmap.getNumSubtree(category)}</span
						>
					</a>
				{/each}
			{:else}
				{#each topics as topic, i}
					{#if i !== 0}
						<div class="border-b opacity-75" />
					{/if}
					<a
						href={`/topics/${topic.id}`}
						class="flex h-auto btn btn-lg btn-ghost w-full font-normal text-base overflow-hidden rounded-md"
					>
						{topic.title}
					</a>
				{/each}
			{/if}
		</div>
	</div>
	<AddCategoryModal open={categoryModalOpen} onClose={closeCategoryModal} />
</div>

<style>
	.container {
		@apply flex flex-col min-w-full max-h-full h-full gap-1 w-full overflow-y-scroll;
	}
	.categories {
		@apply flex justify-center items-center gap-5 flex-col md:flex-row;
		font-family: 'Playwrite AT';
	}
	.switcher {
		@apply relative btn btn-md btn-circle flex;
	}
</style>
