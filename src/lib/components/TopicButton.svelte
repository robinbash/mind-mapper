<script lang="ts">
	import type { Category } from '$lib/common';
	export let category: Category;
</script>

<a href={`/${category.id}`} class={`btn btn-lg w-48 text-white ${category.background}`}>
	<span class={`iconify w-6 h-6 ${category.icon}`} />
	{category.title}</a
>
