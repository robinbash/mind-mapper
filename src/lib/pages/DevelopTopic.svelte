<script lang="ts">
	import { Breadcrumbs, AnimatedText } from '$lib/components';
	import { mindmap } from '$lib/stores';
	import { goto } from '$app/navigation';

	import { develop } from '$lib/stores/develop';
	import { onMount, onDestroy } from 'svelte';
	import { scale, fade } from 'svelte/transition';

	export let topicId: string;
	let inputEl: HTMLDivElement;
	let currentUserText: string | null;
	let textAnimating: boolean;

	$: {
		if ($develop.aiResponseLoading) {
			textAnimating = true;
		}
	}

	$: showUserInput = !$develop.aiResponseLoading && !textAnimating;

	$: topic = $mindmap.find((topic) => topic.id === topicId);
	$: sendDisabled = !(currentUserText ?? '').trim();

	$: {
		if (currentUserText === '' || currentUserText === '\n') {
			currentUserText = null;
		}
	}

	const focus = (element: HTMLDivElement) => {
		if (!element) return;
		element.focus();
	};

	const onFinishedAnimating = () => {
		textAnimating = false;
	};

	const cancel = () => {
		goto(`/${topicId}/details`, { replaceState: true });
	};

	const handleInputShortcuts = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			submitPrompt();
		}
	};

	const submitPrompt = () => {
		if (!currentUserText) return;
		develop.submitPrompt(topicId, currentUserText);
		currentUserText = '';
	};

	const getGuide = () => develop.getGuide(topicId);
	const finish = () => develop.finish(topicId);

	onDestroy(develop.destroy);
	onMount(develop.reset);
</script>

<div class="container">
	<div class="flex flex-col items-center h-full w-full md:w-[40rem] p-5">
		<div class="flex flex-col gap-4 w-full">
			<Breadcrumbs {topicId} />
			<h1 class="flex text-xl font-bold justify-between items-start">
				<span class="pr-1">{topic?.title}</span>
				<button class="btn btn-ghost btn-square btn-sm" on:click={cancel}>
					<span class="iconify mdi--cancel-bold w-5 h-5 flex items-center" />
				</button>
			</h1>
			<div class="inline-flex min-h-10 relative whitespace-pre-line">
				<span class="absolute left-0 top-[0.2rem] iconify mdi--sparkles w-5 h-5 opacity-60" />
				{#if $develop.currentAiRespsonse || $develop.aiResponseLoading}
					<span class="opacity-60">
						<span class="w-6 h-1 inline-block" />
						<AnimatedText
							text={$develop.currentAiRespsonse}
							delay={13}
							duration={350}
							textLoading={$develop.aiResponseLoading}
							{onFinishedAnimating}
						/>
						<!-- {#if !$aiResponseLoading && !textAnimating && $developState === 'guide'}
							<span class="inline-block ml-1 mt-1">
								<button class="btn btn-sm text-opacity-60 btn-square" on:click={getGuide}>
									<div class="flex items-center">
										<span class="iconify mdi--refresh w-4 h-4" />
									</div>
								</button>
							</span>
						{/if} -->
					</span>
				{:else if $develop.state === 'initial'}
					<div class="inline-block mt-[-0.2rem] pl-6">
						<button class="btn btn-sm text-opacity-60" on:click={getGuide}>
							<div class="flex items-center">
								<span class="iconify mdi--question-mark w-4 h-4 mr-1" />Guide me
							</div>
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex justify-center items-end py-8 w-full gap-1">
			{#if showUserInput}
				<div
					in:scale={{ start: 0.9, duration: 200 }}
					class="user-input"
					contenteditable
					bind:this={inputEl}
					bind:innerText={currentUserText}
					on:keydown={handleInputShortcuts}
					role="textbox"
					aria-multiline="true"
					tabindex="0"
					data-placeholder="Type prompt"
				/>
				<button
					in:fade={{ duration: 200 }}
					class="send-button btn btn-square btn-ghost btn-md"
					on:click={submitPrompt}
					disabled={sendDisabled}
				>
					<span class="iconify mdi--send h-6 w-6" />
				</button>
			{/if}
		</div>
		{#if $develop.state === 'prompt' && showUserInput}
			<div class="inline-block">
				<button class="btn btn-sm text-opacity-60" on:click={finish}>
					<div class="flex items-center">
						<span class="iconify mdi--check-circle w-4 h-4 mr-1" />Finish
					</div>
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		@apply flex flex-col items-center justify-center min-h-full min-w-full;
	}
	.user-input {
		@apply bg-base-200 rounded-btn px-4 w-full h-full py-3 break-words outline-none;
	}
	.user-input:empty:not(:focus):before {
		content: attr(data-placeholder);
		opacity: 0.6;
	}
	.send-button {
		@apply w-9 h-12 mb-[1px] disabled:bg-transparent;
	}
</style>
