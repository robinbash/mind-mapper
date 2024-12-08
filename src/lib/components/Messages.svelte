<script lang="ts">
	import type { Message } from '$lib/types';
	import SparklesText from './SparklesText.svelte';
	import AnimatedText from './AnimatedText.svelte';

	export let messages: Message[];
	export let currentAiResponse: string;
	export let aiResponseLoading: boolean;
	export let onFinishedAnimating: () => void;

	const mockMessages: Message[] = [
		{
			role: 'user',
			content: 'Hi, Can you help me write a poem? It should be funny and witty and cool.'
		},
		{
			role: 'assistant',
			content: 'Sure thing, here it goes: Ottos mops trotzt. Otto: soso',
			type: 'answer'
		},
		{ role: 'user', content: 'Thank you, very nice!' },
		{ role: 'assistant', content: 'Youre welcome.', type: 'answer' },
		{ role: 'user', content: 'Hi, Can you help me write a poem?' },
		{
			role: 'assistant',
			content: 'Sure thing, here it goes: Ottos mops trotzt. Otto: soso',
			type: 'answer'
		},
		{ role: 'user', content: 'Thank you, very nice!' },
		{ role: 'assistant', content: 'Youre welcome.', type: 'answer' },
		{ role: 'user', content: 'Hi, Can you help me write a poem?' },
		{
			role: 'assistant',
			content: 'Sure thing, here it goes: Ottos mops trotzt. Otto: soso',
			type: 'answer'
		},
		{ role: 'user', content: 'Thank you, very nice!' },
		{ role: 'assistant', content: 'Youre welcome.', type: 'answer' }
	];
</script>

<div class="flex flex-col gap-5 h-full max-h-full w-full overflow-y-scroll pb-4">
	{#each mockMessages as message}
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
	{#if currentAiResponse}
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
