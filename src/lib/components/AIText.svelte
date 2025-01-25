<script>
	import CodeRenderer from './CodeRenderer.svelte';
	import ImageRenderer from './ImageRenderer.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	// import Markdown from '@magidoc/plugin-svelte-marked';

	export let addSparkes = false;
	export let text;
</script>

<span class="markdown-text relative w-full opacity-65">
	<SvelteMarkdown
		source={(addSparkes ? '![](sparkles)' : '') + text}
		renderers={{ code: CodeRenderer, image: ImageRenderer }}
	/>
	<!-- <Markdown
		source={'test ```python def bubble_sort(arr): n ='}
		renderers={{ code: CodeRenderer, text: TextRenderer }}
	/> -->
</span>

<style>
	:global(code) {
		@apply break-words text-base bg-base-300;
	}
	:global(.markdown-text > *) {
		all: revert;
	}
</style>
