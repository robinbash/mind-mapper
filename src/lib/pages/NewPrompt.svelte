<script lang="ts">
	import { Breadcrumbs, AnimatedText, PromptInput, Messages } from '$lib/components';
	import { mindmap } from '$lib/stores';
	import { goto } from '$app/navigation';

	import { chat as chatStore } from '$lib/stores/chat';
	import { onMount, onDestroy } from 'svelte';

	let textAnimating: boolean;

	$: {
		if ($chatStore.aiResponseLoading) {
			textAnimating = true;
		}
	}
	$: {
		if (!$chatStore.aiResponseLoading && !$chatStore.currentAiResponse) {
			textAnimating = false;
		}
	}

	$: showUserInput = !$chatStore.aiResponseLoading && !textAnimating;

	$: showAI = $chatStore.currentAiResponse || $chatStore.aiResponseLoading;

	const onFinishedAnimating = () => {
		textAnimating = false;
		chatStore.consolidate();
	};

	const cancel = () => {
		chatStore.reset();
		goto(`/`, { replaceState: true });
	};

	const submitPrompt = (currentUserText: string | null) => {
		if (!currentUserText) return;
		chatStore.submitPrompt(currentUserText);
	};

	const save = () => {
		chatStore.save();
	};

	onDestroy(chatStore.destroy);
	onMount(chatStore.reset);
</script>

<div class="flex flex-col h-full w-full md:w-[44rem] items-center justify-between">
	<div class="flex justify-between w-full py-8">
		<button class="btn btn-ghost btn-square btn-sm" on:click={cancel}
			><span class="iconify mdi--cancel-bold h-6 w-6" /></button
		>
		<button class="btn btn-ghost btn-sm" on:click={save}
			><span class="iconify mdi--content-save h-6 w-6" />Save chat
		</button>
	</div>
	<!-- <Breadcrumbs /> -->
	<!-- <div class="flex items-center pb-3 justify-between w-full">
			<div class="flex font-bold justify-between items-start py-3">
				<span class="relative pl-6 inline-block items-center pr-3">
					<span class="absolute left-0 top-1 iconify {developIcon} w-4 h-4" />
					{developTitle} - {topic?.title}</span
				>
			</div>
			<button class="btn btn-ghost btn-square btn-sm" on:click={cancel}>
				<span class="iconify mdi--cancel-bold w-5 h-5 flex items-center" />
			</button>
		</div> -->
	{#if $chatStore.state === 'finishing'}
		<div class="flex w-full h-full justify-center items-center pt-8 opacity-65">
			<span class="font-semibold">Saving topic</span><span
				class="loading loading-dots loading-md ml-2 mt-1"
			/>
		</div>
	{:else}
		<Messages
			messages={$chatStore.messages}
			aiResponseLoading={$chatStore.aiResponseLoading}
			currentAiResponse={$chatStore.currentAiResponse}
			{onFinishedAnimating}
		/>

		<!-- {#if showUserInput && showAI}
				<div class="flex gap-4 items-center pt-6">
					{#if $chatStore.mode === 'tell'}
						<button class="btn btn-sm text-opacity-65" on:click={acceptSuggestion}>
							<div class="flex items-center">
								<span class="iconify mdi--check w-4 h-4 mr-1" />Accept
							</div>
						</button>
					{/if}
					{#if modeIsChosen}
						<button class="btn btn-sm text-opacity-65" on:click={chatStore.ignore}>
							<div class="flex items-center">
								<span class="iconify mdi--close w-4 h-4 mr-1" />Ignore
							</div>
						</button>
						<button class="btn btn-sm text-opacity-65" on:click={generate}>
							<div class="flex items-center">
								<span class="iconify mdi--refresh w-4 h-4 mr-1" />Next
							</div>
						</button>
					{/if}
				</div>
			{/if} -->
		{#if showUserInput}
			<div class="py-8 w-full">
				<PromptInput {submitPrompt} />
			</div>
		{/if}

		<!-- {#if $chatStore.state === 'finishable' && showUserInput}
			<div class="inline-block">
				<button class="btn btn-sm text-opacity-65" on:click={finish}>
					<div class="flex items-center">
						<span class="iconify mdi--check-circle w-4 h-4 mr-1" />Finish
					</div>
				</button>
			</div>
		{/if} -->
	{/if}
</div>

<style>
	.container {
		@apply flex flex-col h-full;
	}
</style>
