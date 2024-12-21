<script lang="ts">
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import { logout } from '$lib/auth';
	import { mindmap } from '$lib/stores';

	$: rootTopics = $mindmap.filter((topic) => !topic.parentId);

	onMount(() => {
		themeChange(false);
	});
</script>

<div class="absolute top-0 w-full flex px-6 md:p-8 mt-3 pt-inset items-center justify-between">
	<button class="btn btn-md btn-circle" on:click={logout}
		><span class="iconify mdi--logout" /></button
	>
	<button class="switcher" data-toggle-theme="dracula,emerald">Toggle theme</button>
</div>
<div class="w-full pt-20 pb-8 px-4">
	<div class="container">
		<div class="flex w-full">
			<div class="flex w-1/2 justify-center">
				<a href="/new" class="w-32 flex gap-2 btn btn-md font-normal text-base btn-primary">
					<span class="iconify w-5 h-5 mdi--plus" />
					Prompt</a
				>
			</div>

			<div class="flex w-1/2 justify-center">
				<a href="/new" class="w-32 btn btn-md font-normal text-base btn-primary">
					<span class="iconify w-5 h-5 mdi--plus" />
					Category</a
				>
			</div>
		</div>
		<div class="container">
			{#each rootTopics as topic}
				<a href={`/topics/${topic.id}`} class="btn btn-lg w-full font-normal text-base rounded-md">
					{topic.title}
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		@apply flex flex-col min-w-full max-h-full h-full gap-5 w-full  overflow-y-scroll;
	}
	.categories {
		@apply flex justify-center items-center gap-5 flex-col md:flex-row;
		font-family: 'Playwrite AT';
	}
	.switcher {
		@apply btn btn-sm font-semibold;
	}
</style>
