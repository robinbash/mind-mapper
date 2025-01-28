<script lang="ts">
	import type { Message } from '$lib/types';
	import AIText from './AIText.svelte';
	import AnimatedText from './AnimatedText.svelte';

	export let messages: Message[];
	export let currentAiResponse: string;
	export let aiResponseLoading: boolean;
	export let onFinishedAnimating: () => void;
	$: lastMessageIsAi = messages.at(-1)?.role === 'assistant';

	let scrolledToTop = true;
	let scrolledToBottom = true;
	let messagesEl: HTMLSpanElement;

	let bufferedAiResponse = '';
	let buffering = false;

	const addChar = () => {
		bufferedAiResponse = currentAiResponse.slice(0, bufferedAiResponse.length + 1);
	};

	const buffer = () => {
		buffering = true;
		addChar();
		if (currentAiResponse.length === bufferedAiResponse.length) {
			buffering = false;
			if (!aiResponseLoading) {
				onFinishedAnimating();
			}
			return;
		}
		setTimeout(buffer, 10);
	};

	$: if (currentAiResponse) {
		if (currentAiResponse.length !== bufferedAiResponse.length && !buffering) {
			buffer();
		}
	} else {
		bufferedAiResponse = currentAiResponse;
	}

	const checkScroll = () => {
		if (!messagesEl) return;
		scrolledToBottom = messagesEl.scrollHeight - messagesEl.scrollTop < messagesEl.clientHeight + 3;
		scrolledToTop = messagesEl.scrollTop <= 0;

		console.log(scrolledToBottom, scrolledToTop);
	};

	$: {
		if (messagesEl) {
			checkScroll();
		}
	}

	const scrollToBottom = () => {
		messagesEl.scrollTo({
			behavior: 'smooth',
			top: messagesEl.scrollHeight
		});
	};
</script>

<div class="relative h-full max-h-full max-w-full w-full overflow-y-scroll">
	<div
		class="flex flex-col gap-3 h-full max-h-full w-full max-w-full overflow-y-scroll pb-4"
		on:scroll={() => {
			checkScroll();
		}}
		bind:this={messagesEl}
		class:shadow-both={!scrolledToTop && !scrolledToBottom}
		class:shadow-top={scrolledToTop && !scrolledToBottom}
		class:shadow-bottom={!scrolledToTop && scrolledToBottom}
	>
		{#if messages.length === 0}
			<span
				class="flex h-full max-h-full w-full items-center justify-center opacity-65 break-words whitespace-normal"
				>No Messages yet</span
			>
		{/if}
		{#each messages as message}
			{#if message.role === 'assistant'}
				<AIText text={message.content} addSparkes />
			{:else}
				<div class="flex w-full justify-end">
					<span class="flex rounded-md px-4 py-2 bg-base-200 max-w-[90%]">
						{message.content}
					</span>
				</div>
			{/if}
		{/each}
		{#if bufferedAiResponse.length > 0 && !lastMessageIsAi}
			<AIText text={bufferedAiResponse} addSparkes />
			<!-- <AnimatedText
				text={currentAiResponse}
				delay={8}
				duration={350}
				textLoading={aiResponseLoading}
				{onFinishedAnimating}
			/> -->
		{/if}
	</div>
	<div class="absolute bottom-0 w-full flex justify-center">
		{#if !scrolledToBottom}
			<button class="opacity-35 btn btn-circle btn-sm mb-1" on:click={scrollToBottom}
				><span class="iconify mdi--arrow-down h-5 w-5" /></button
			>
		{/if}
	</div>
</div>

<style>
	/* .shadow-both {
		box-shadow:
			inset 0px -10px 5px -5px rgba(83, 83, 83, 0.15),
			inset 0px 10px 5px -5px rgba(83, 83, 83, 0.15);
	}
	.shadow-bottom {
		box-shadow: inset 0px 10px 5px -5px rgba(83, 83, 83, 0.15);
	}
	.shadow-top {
		box-shadow: inset 0px -10px 5px -5px rgba(83, 83, 83, 0.15);
	} */
</style>
