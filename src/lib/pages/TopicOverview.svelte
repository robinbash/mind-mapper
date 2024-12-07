<script lang="ts">
	import { Breadcrumbs, TopicActionsDropdown, PromptInput } from '$lib/components';
	import Messages from '$lib/components/Messages.svelte';
	import { mindmap } from '$lib/stores';

	export let topicId: string;
	let expanded = false;
	let scrolledToTop = true;
	let scrolledToBottom = true;
	let loading = false;

	let tab: 'summary' | 'chat' = 'summary';

	let inputShowing = false;

	let descriptionEl: HTMLSpanElement;

	$: topic = $mindmap.find((n) => n.id === topicId);
	$: children = $mindmap.filter((n) => n.parentId === topicId);
	$: isRoot = topic?.parentId === undefined;

	$: if (topic && topicId) {
		expanded = children.length === 0 && !isRoot;
	}

	$: {
		if (descriptionEl || tab) {
			checkScroll();
		}
	}

	const checkScroll = () => {
		if (!descriptionEl) return;
		scrolledToBottom =
			descriptionEl.scrollHeight - descriptionEl.scrollTop < descriptionEl.clientHeight + 3;
		scrolledToTop = descriptionEl.scrollTop <= 0;
	};
</script>

<div class="container">
	<div class="flex flex-col md:w-[44rem] w-full h-full p-5">
		<Breadcrumbs {topicId} />
		<div class="flex w-full items-center">
			<button
				class="flex h-full relative font-bold text-base btn btn-lg btn-outline w-full px-9 py-2 rounded-md"
				on:click={() => {
					expanded = !expanded;
				}}
			>
				<div class="absolute left-2 flex w-9 items-center">
					<span
						class="iconify mdi--chevron-right w-5 h-5 transition-all"
						class:rotate-90={expanded}
					/>
				</div>
				<span class="w-full">{topic?.title}</span>
			</button>
		</div>
		{#if loading}
			<div class="w-full flex justify-center pt-8 opacity-65">
				<span class="loading loading-dots loading-md ml-2 mt-1" />
			</div>
		{/if}
		{#if expanded && !loading}
			<span
				class="flex h-full max-h-full w-full overflow-y-scroll"
				on:scroll={() => {
					checkScroll();
				}}
				bind:this={descriptionEl}
				class:shadow-both={!scrolledToTop && !scrolledToBottom}
				class:shadow-top={scrolledToTop && !scrolledToBottom}
				class:shadow-bottom={!scrolledToTop && scrolledToBottom}
			>
				{#if tab === 'summary'}
					<span class="opacity-65 my-6">
						{topic?.description}
					</span>
				{/if}
				{#if tab === 'chat'}
					<!-- {#if !topic?.messages}
						<div class="w-full flex justify-center">No chat messages here</div>
					{:else} -->
					<div class="flex flex-col py-4">
						<Messages messages={topic?.messages || []} />
						{#if inputShowing}
							<PromptInput submitPrompt={() => {}} />
						{:else}
							<div class="flex justify-end pt-2">
								<button
									class="send-button btn btn-square btn-md"
									on:click={() => {
										inputShowing = true;
									}}
								>
									<span class="opacity-65 iconify mdi--send h-6 w-6" />
								</button>
							</div>
						{/if}
					</div>
					<!-- {/if} -->
				{/if}
			</span>

			{#if !isRoot}
				<div class="w-full flex pb-4 justify-center gap-4">
					<!-- <a class="btn btn-sm" href={`/topics/${topicId}/refine`}
						><span class="iconify mdi--lead-pencil" /> Refine</a
					> -->
					<!-- <button class="btn btn-sm"
						><span class="iconify mdi--format-page-split w-5 h-5" /> Split</button
					> -->
					<div role="tablist" class="tabs tabs-bordered tabs-sm">
						<button
							role="tab"
							class="tab"
							class:tab-active={tab === 'summary'}
							on:click={() => {
								tab = 'summary';
							}}>Summary</button
						>
						<button
							role="tab"
							class="tab"
							class:tab-active={tab === 'chat'}
							on:click={() => {
								tab = 'chat';
							}}>Chat</button
						>
					</div>
					<div class="absolute right-8">
						<TopicActionsDropdown
							{topic}
							setLoading={(value) => {
								loading = value;
							}}
						/>
					</div>
				</div>
			{/if}
		{/if}
		{#if !expanded && !loading}
			<div class="flex justify-center flex-col gap-4 pt-4 pb-6">
				{#each children as child}
					<a
						href={`/topics/${child.id}`}
						class="flex h-auto btn btn-lg w-full font-normal text-base overflow-hidden py-2 rounded-md"
					>
						{child.title}
					</a>
				{/each}

				<a
					href={`/topics/${topicId}/expand`}
					class="btn btn-lg text-opacity-65 w-full font-normal text-base gap-1 rounded-md"
				>
					<span class="iconify mdi--add w-5 h-5" />Add Subtopic
				</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
	.shadow-both {
		box-shadow:
			inset 0px -8px 5px -5px rgba(0, 0, 0, 0.15),
			inset 0px 8px 5px -5px rgba(0, 0, 0, 0.15);
	}
	.shadow-bottom {
		box-shadow: inset 0px 8px 5px -5px rgba(0, 0, 0, 0.15);
	}
	.shadow-top {
		box-shadow: inset 0px -8px 5px -5px rgba(0, 0, 0, 0.15);
	}
</style>
