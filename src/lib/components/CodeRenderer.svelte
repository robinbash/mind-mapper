<script lang="ts">
	import { HighlightAuto } from 'svelte-highlight';
	import theme from 'svelte-highlight/styles/atom-one-dark';
	export let text = '';
</script>

<svelte:head>
	{@html theme}
</svelte:head>

<HighlightAuto code={text} />

<style>
	:global(.hljs) {
		@apply rounded-lg;
	}
</style>
