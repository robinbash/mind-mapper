<script>
	import { NodeButton } from '$lib/components';
	import { CATEGORIES } from '$lib/categories';
</script>

<div class="container">
	{#each CATEGORIES as category}
		<NodeButton {category} />
	{/each}
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full gap-5 flex-col md:flex-row;
		font-family: 'Playwrite AT';
	}
</style>
