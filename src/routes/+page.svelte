<script>
	import { NodeButton } from '$lib/components';
	import { CATEGORIES } from '$lib/categories';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';

	onMount(() => {
		themeChange(false);
	});
</script>

<div class="container">
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
