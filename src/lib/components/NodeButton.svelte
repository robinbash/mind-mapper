<script lang="ts">
	import type { Category } from '$lib/categories';
	export let category: Category;
</script>

<a href={category.href} class={`btn btn-lg w-48 text-white ${category.background ?? ''}`}>
	{#if category.icon}
		<span class={`iconify w-6 h-6 ${category.icon}`} />
	{/if}
	{category.name}</a
>
