<script>
	export let href = '';
	export let title = undefined;
	export let text = '';
</script>

{#if href === 'sparkles'}
	<span class="absolute left-0 iconify mdi--sparkles w-4 h-4 mt-1" /><span
		class="w-7 inline-block"
	/>
{:else}
	<img src={href} {title} alt={text} />
{/if}
