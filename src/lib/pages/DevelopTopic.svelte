<script lang="ts">
	import { Breadcrumbs, AnimatedText, PromptInput } from '$lib/components';
	import { mindmap } from '$lib/stores';
	import { goto } from '$app/navigation';

	import type { DevelopmentStore } from '$lib/stores/develop';
	import { onMount, onDestroy } from 'svelte';

	export let developTitle: string;
	export let developIcon: string;
	export let developStore: DevelopmentStore;
	export let topicId: string;
	let textAnimating: boolean;

	$: {
		if ($developStore.aiResponseLoading) {
			textAnimating = true;
		}
	}
	$: {
		if (!$developStore.aiResponseLoading && !$developStore.currentAiRespsonse) {
			textAnimating = false;
		}
	}

	$: modeIsChosen = $developStore.mode !== 'initial';

	$: showUserInput = !$developStore.aiResponseLoading && !textAnimating && modeIsChosen;

	$: showAI = $developStore.currentAiRespsonse || $developStore.aiResponseLoading;

	$: topic = $mindmap.find((topic) => topic.id === topicId);

	// const focus = (element: HTMLDivElement) => {
	// 	if (!element) return;
	// 	element.focus();
	// };

	const onFinishedAnimating = () => {
		textAnimating = false;
	};

	const cancel = () => {
		developStore.reset();
		goto(`/${topicId}`, { replaceState: true });
	};

	const submitPrompt = (currentUserText: string | null) => {
		if (!currentUserText) return;
		developStore.submitPrompt(topicId, currentUserText);
	};

	const generate = () => developStore.generate(topicId);
	const finish = () => developStore.finish(topicId);
	const acceptSuggestion = () => developStore.acceptSuggestion(topicId);

	onDestroy(developStore.destroy);
	onMount(developStore.reset);
</script>

<div class="container">
	<div class="flex flex-col items-center h-full w-full md:w-[44rem] p-5">
		<Breadcrumbs {topicId} />
		<div class="flex items-center pb-3 justify-between w-full">
			<div class="flex font-bold justify-between items-start py-3">
				<span class="relative pl-6 inline-block items-center pr-3">
					<span class="absolute left-0 top-1 iconify {developIcon} w-4 h-4" />
					{developTitle} - {topic?.title}</span
				>
			</div>
			<button class="btn btn-ghost btn-square btn-sm" on:click={cancel}>
				<span class="iconify mdi--cancel-bold w-5 h-5 flex items-center" />
			</button>
		</div>
		{#if $developStore.state === 'finishing'}
			<div class="w-full flex justify-center pt-8 opacity-65">
				<span class="font-semibold">Developing topic</span><span
					class="loading loading-dots loading-md ml-2 mt-1"
				/>
			</div>
		{:else}
			{#if !modeIsChosen}
				<div class="flex justify-center w-full">
					<div class="grid gap-4 w-full grid-cols-2 max-w-80">
						<button
							class="flex btn btn-outline w-full col-start-1 h-full p-4 pb-6"
							on:click={developStore.setGuide}
						>
							<div class="h-full flex gap-4 flex-col">
								<div class="flex items-center justify-center font-bold text-base">
									<span class="iconify mdi--help-circle-outline w-5 h-5 mr-1" />
									Guide me
								</div>
								<div class="flex text-left opacity-65 font-normal">
									AI asks me questions, I give the answers.
								</div>
							</div>
						</button>

						<button
							class="flex btn btn-outline w-full col-start-2 h-full p-4 pb-6"
							on:click={developStore.setTell}
						>
							<div class="h-full flex gap-4 flex-col">
								<div class="flex items-center justify-center font-bold text-base">
									<span class="iconify mdi--lightbulb-variant-outline w-5 h-5 mr-1" />
									Tell me
								</div>
								<div class="flex opacity-65 text-left font-normal">
									AI suggests answers, I accept or dismiss them.
								</div>
							</div>
						</button>
					</div>
				</div>
			{/if}
			{#if modeIsChosen}
				<div class="inline-flex relative whitespace-pre-line w-full">
					<span class="absolute left-0 top-[0.2rem] iconify mdi--sparkles w-5 h-5 opacity-65" />
					{#if showAI}
						<span>
							<span class="w-6 h-1 inline-block" />
							<span class="opacity-65">
								<AnimatedText
									text={$developStore.currentAiRespsonse}
									delay={13}
									duration={350}
									textLoading={$developStore.aiResponseLoading}
									{onFinishedAnimating}
								/>
							</span>
							<!-- {#if !$developStore.aiResponseLoading && !textAnimating && $developStore.currentAiRespsonse && false}
								<span class="inline-block relative h-3 w-6">
									<div
										class="flex items-center absolute top-1/2 -translate-y-1/2"
										in:fade={{ duration: 200 }}
									>
										<button class=" btn btn-xs btn-ghost btn-square" on:click={getGuide}>
											<span class=" iconify mdi--refresh w-6 h-6 opacity-65" />
										</button>
									</div>
								</span>
							{/if} -->
						</span>
					{:else}
						<div class="inline-block mt-[-0.2rem] pl-6 items-center">
							<button class="btn btn-sm text-opacity-65" on:click={generate}>
								<div class="flex items-center">
									<span class="iconify mdi--refresh w-5 h-5 mr-1" />Generate
								</div>
							</button>
							<!-- <button class="btn btn-sm text-opacity-65" on:click={getGuide}>
								<div class="flex items-center">
									<span class="iconify mdi--lightbulb-variant w-4 h-4 mr-1" />Tell me
								</div>
							</button> -->
						</div>
					{/if}
				</div>
			{/if}
			{#if showUserInput && showAI}
				<div class="flex gap-4 items-center pt-6">
					{#if $developStore.mode === 'tell'}
						<button class="btn btn-sm text-opacity-65" on:click={acceptSuggestion}>
							<div class="flex items-center">
								<span class="iconify mdi--check w-4 h-4 mr-1" />Accept
							</div>
						</button>
					{/if}
					{#if modeIsChosen}
						<button class="btn btn-sm text-opacity-65" on:click={developStore.ignore}>
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
			{/if}
			{#if showUserInput}
				<PromptInput {submitPrompt} />
			{/if}

			{#if $developStore.state === 'finishable' && showUserInput}
				<div class="inline-block">
					<button class="btn btn-sm text-opacity-65" on:click={finish}>
						<div class="flex items-center">
							<span class="iconify mdi--check-circle w-4 h-4 mr-1" />Finish
						</div>
					</button>
				</div>
			{/if}
			{#if modeIsChosen}
				<div class="flex justify-center w-full h-full items-end gap-2 pb-6">
					<button class="join-item btn btn-sm" on:click={developStore.toggleMode}>
						<span class:opacity-35={$developStore.mode !== 'guide'}>Guide</span>
						<span class="iconify mdi--exchange w-5 h-5" />
						<span class:opacity-35={$developStore.mode !== 'tell'}>Tell</span>
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.container {
		@apply flex flex-col items-center justify-center min-h-full min-w-full;
	}
</style>
