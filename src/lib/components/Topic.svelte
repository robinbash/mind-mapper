<script lang="ts">
	import {
		Breadcrumbs,
		TopicActionsDropdown,
		PromptInputButton,
		Messages,
		AIText
	} from '$lib/components';
	import { topicChat } from '$lib/stores/topicChat';
	import { mindmap } from '$lib/stores';
	import { register } from 'swiper/element/bundle';
	import { onMount } from 'svelte';
	import type Swiper from 'swiper';
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';
	import type { Message, Topic } from '$lib/types';

	onMount(() => {
		register();
	});

	export let topic: Topic;

	let expanded = false;
	let scrolledToTop = true;
	let scrolledToBottom = true;
	let loading = false;
	let inputShowing = false;
	let summaryEl: HTMLSpanElement;
	let shownMessages: Message[] = [];

	type Tab = 'summary' | 'chat';

	let tab: Tab = 'summary';

	const setInputShowing = (value: boolean) => {
		inputShowing = value;
		expanded = true;
	};

	const toggleExpand = () => {
		tab = 'summary';
		inputShowing = false;
		expanded = !expanded;
	};

	const onFinishedAnimating = () => {
		shownMessages = [
			...shownMessages,
			{ content: $topicChat.currentAiResponse, role: 'assistant', type: 'answer' }
		];
		topicChat.consolidate(topic.id);
	};

	$: children = $mindmap.filter((n) => n.parentId === topic.id);
	$: isRoot = topic?.parentId === undefined;

	$: if (topic && topic.id) {
		// expanded = children.length === 0 && !isRoot;
		loading = false;
		shownMessages = topic.messages;
	}

	$: {
		if (summaryEl || tab) {
			checkScroll();
		}
	}

	const checkScroll = () => {
		if (!summaryEl) return;
		scrolledToBottom = summaryEl.scrollHeight - summaryEl.scrollTop < summaryEl.clientHeight + 3;
		scrolledToTop = summaryEl.scrollTop <= 0;
	};

	const submitPrompt = (text: string | null) => {
		if (!topic || !text) return;
		shownMessages = [...shownMessages, { content: text, role: 'user' }];
		topicChat.submitPrompt(topic.id, text, topic.messages);
	};
</script>

<div class="flex w-full items-center">
	<button class="flex h-full relative font-bold text-base w-full px-6 py-5" on:click={toggleExpand}>
		<div class="absolute left-0 flex w-9 items-center">
			<span class="iconify mdi--chevron-right w-6 h-6 transition-all" class:rotate-90={expanded} />
		</div>
		<span class="w-full">{topic?.title}</span>
	</button>
</div>
{#if loading}
	<div class="w-full flex justify-center pt-8 opacity-65">
		<span class="loading loading-dots loading-md ml-2 mt-1" />
	</div>
{/if}
{#if !loading}
	<span
		class="flex h-full max-h-full w-full overflow-y-scroll"
		on:scroll={() => {
			checkScroll();
		}}
		bind:this={summaryEl}
		class:shadow-both={!scrolledToTop && !scrolledToBottom}
		class:shadow-top={scrolledToTop && !scrolledToBottom}
		class:shadow-bottom={!scrolledToTop && scrolledToBottom}
	>
		{#if !expanded}
			<span class="h-full max-h-full w-full overflow-y-scroll opacity-65">
				<AIText text={topic?.summary} />
			</span>
		{:else}
			<div class="flex flex-col py-4 max-h-full h-full w-full overflow-y-scroll">
				<Messages
					messages={shownMessages}
					currentAiResponse={$topicChat.currentAiResponse}
					aiResponseLoading={$topicChat.aiResponseLoading}
					{onFinishedAnimating}
				/>
			</div>{/if}
	</span>

	<div class="w-full flex pb-4 justify-end itmes-center gap-4">
		{#if !inputShowing}
			<button class="btn btn-square btn-md">
				<span class=" iconify mdi--search h-6 w-6" />
			</button>
		{/if}
		<PromptInputButton {submitPrompt} {setInputShowing} {inputShowing} />
		{#if !inputShowing}
			<TopicActionsDropdown
				{topic}
				setLoading={(value) => {
					loading = value;
				}}
			/>
		{/if}
	</div>
{/if}

<style>
	.loading {
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
