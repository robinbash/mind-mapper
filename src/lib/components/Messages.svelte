<script lang="ts">
	import type { Message } from '$lib/types';
	import SparklesText from './SparklesText.svelte';

	export let messages: Message[];

	const mockMessages: Message[] = [
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

<div class="flex flex-col gap-4 h-full max-h-full overflow-y-scroll">
	{#each mockMessages as message}
		{#if message.role === 'assistant'}
			<SparklesText text={message.content} />
		{:else}
			<div class="pl-12">
				<div class="rounded-md px-3 py-1 bg-base-200">
					{message.content}
				</div>
			</div>
		{/if}
	{/each}
</div>
