<script lang="ts">
	import type { Message } from '$lib/types';
	import SparklesText from './SparklesText.svelte';
	import AnimatedText from './AnimatedText.svelte';

	export let messages: Message[];
	export let currentAiResponse: string;
	export let aiResponseLoading: boolean;
	export let onFinishedAnimating: () => void;
	$: lastMessageIsAi = messages.at(-1)?.role === 'assistant';
</script>

<div class="flex flex-col gap-5 h-full max-h-full w-full overflow-y-scroll pb-4">
	{#if messages.length === 0}
		<span class="h-full w-full flex items-center justify-center opacity-65">No Messages yet</span>
	{/if}
	{#each messages as message}
		{#if message.role === 'assistant'}
			<SparklesText>{message.content}</SparklesText>
		{:else}
			<div class="flex w-full justify-end">
				<div class="flex rounded-md px-4 py-2 bg-base-200 max-w-[80%]">
					{message.content}
				</div>
			</div>
		{/if}
	{/each}
	{#if currentAiResponse && !lastMessageIsAi}
		<SparklesText>
			<AnimatedText
				text={currentAiResponse}
				delay={8}
				duration={350}
				textLoading={aiResponseLoading}
				{onFinishedAnimating}
			/>
		</SparklesText>
	{/if}
</div>
