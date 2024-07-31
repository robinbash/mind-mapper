<script>
	import { NodeButton } from '$lib/components';
	import { CATEGORIES } from '$lib/categories';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import { logout } from '$lib/auth';

	onMount(() => {
		themeChange(false);
	});
</script>

<div class="container">
	<div class="absolute top-0 w-full flex p-6 md:p-8">
		<button class="btn btn-md btn-circle" on:click={logout}
			><span class="iconify mdi--logout" /></button
		>
	</div>
	<div class="categories">
		{#each CATEGORIES as category}
			<NodeButton {category} />
		{/each}
	</div>
	<button class="switcher" data-toggle-theme="dracula,bumblebee">Toggle theme</button>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full gap-5 flex-col;
	}
	.categories {
		@apply flex justify-center items-center gap-5 flex-col md:flex-row;
		font-family: 'Playwrite AT';
	}
	.switcher {
		@apply btn btn-sm;
	}
</style>
