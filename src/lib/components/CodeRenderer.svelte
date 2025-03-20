<script lang="ts">
	import { HighlightAuto } from 'svelte-highlight';
	import theme from 'svelte-highlight/styles/atom-one-dark';
	export let text = '';
	export let lang = '';

	const copyCode = () => {
		navigator.clipboard.writeText(text);
	};
</script>

<svelte:head>
	{@html theme}
</svelte:head>

<div class="relative group">
	<HighlightAuto code={text} {lang} />
	<button
		class="btn btn-sm mt-2 mr-2 text-white absolute top-0 right-0 opacity-65 hidden group-hover:flex"
		on:click={copyCode}><span class="iconify mdi--content-copy h-5 w-5" /></button
	>
</div>

<style>
	:global(.hljs) {
		@apply rounded-lg;
	}
</style>
