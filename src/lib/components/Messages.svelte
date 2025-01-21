<script lang="ts">
	import type { Message } from '$lib/types';
	import AIText from './AIText.svelte';
	import AnimatedText from './AnimatedText.svelte';

	export let messages: Message[];
	export let currentAiResponse: string;
	export let aiResponseLoading: boolean;
	export let onFinishedAnimating: () => void;
	$: lastMessageIsAi = messages.at(-1)?.role === 'assistant';
</script>

<div class="flex flex-col gap-3 h-full max-h-full w-full overflow-y-scroll pb-4">
	{#if messages.length === 0}
		<span class="h-full w-full flex items-center justify-center opacity-65">No Messages yet</span>
	{/if}
	{#each messages as message}
		{#if message.role === 'assistant'}
			<AIText text={message.content} />
		{:else}
			<div class="flex w-full justify-end">
				<span class="flex rounded-md px-4 py-2 bg-base-200 max-w-[90%]">
					{message.content}
				</span>
			</div>
		{/if}
	{/each}
	{#if currentAiResponse && !lastMessageIsAi}
		<AnimatedText
			text={currentAiResponse}
			delay={8}
			duration={350}
			textLoading={aiResponseLoading}
			{onFinishedAnimating}
		/>
	{/if}
</div>
