<script lang="ts">
	import { Breadcrumbs, TopicActionsDropdown, PromptInputButton, Messages } from '$lib/components';
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

	let swiperEl: { swiper: Swiper } | null = null;

	const swiperParams = {
		slidesPerView: 1,
		navigation: false,

		spaceBetween: 50
	};

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
	};

	const toggleExpand = () => {
		tab = 'summary';
		inputShowing = false;
		expanded = !expanded;
	};

	const goToTab = (tab: Tab) => {
		const swiper = swiperEl?.swiper;
		if (swiper) {
			swiper.slideTo(tab === 'summary' ? 0 : 1);
		}
	};

	const handleSlideChange = () => {
		const swiper = swiperEl?.swiper;
		if (swiper) {
			tab = swiper.activeIndex === 0 ? 'summary' : 'chat';
		}
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
		expanded = children.length === 0 && !isRoot;
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
{#if expanded && !loading}
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
		<swiper-container
			{...swiperParams}
			bind:this={swiperEl}
			on:swiperslidechange={handleSlideChange}
			class="flex max-h-full h-full"
		>
			<swiper-slide class="flex h-full w-full py-4">
				<span class="opacity-65 h-full max-h-full w-full overflow-y-scroll">
					{topic?.summary}
				</span>
			</swiper-slide>
			<swiper-slide class="max-h-full h-full w-full">
				<div class="flex flex-col py-4 max-h-full h-full w-full overflow-y-scroll">
					<Messages
						messages={shownMessages}
						currentAiResponse={$topicChat.currentAiResponse}
						aiResponseLoading={$topicChat.aiResponseLoading}
						{onFinishedAnimating}
					/>
					<div class="flex justify-end pt-3 gap-4 pb-1">
						{#if !inputShowing}
							<button class="btn btn-square btn-md">
								<span class="opacity-65 iconify mdi--search h-6 w-6" />
							</button>
						{/if}
						<PromptInputButton {submitPrompt} {setInputShowing} {inputShowing} />
					</div>
				</div>
			</swiper-slide>
		</swiper-container>
	</span>

	<div class="w-full flex pb-6 justify-center gap-4">
		<!-- <a class="btn btn-sm" href={`/topics/${topicId}/refine`}
						><span class="iconify mdi--lead-pencil" /> Refine</a
					> -->
		<!-- <button class="btn btn-sm"
						><span class="iconify mdi--format-page-split w-5 h-5" /> Split</button
					> -->
		<div class="flex gap-4">
			<button on:click={() => goToTab('summary')}>
				<span
					class="iconify mdi--file-document-box-outline h-5 w-5"
					class:opacity-65={tab !== 'summary'}
				/>
			</button>
			<button on:click={() => goToTab('chat')}>
				<span
					class="iconify mdi--chat-bubble-outline h-5 w-5"
					class:opacity-65={tab !== 'chat'}
				/></button
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
{#if !expanded && !loading}
	<div class="flex justify-center flex-col gap-4 pt-4 pb-6">
		{#each children as child}
			<a
				href={`/topics/${child.id}`}
				class="flex h-auto btn btn-lg w-full font-normal text-base overflow-hidden rounded-md"
			>
				{child.title}
			</a>
		{/each}

		<a
			href={`/topics/${topic.id}/expand`}
			class="btn btn-lg text-opacity-65 w-full font-normal text-base gap-1 rounded-md"
		>
			<span class="iconify mdi--add w-5 h-5" />Add Subtopic
		</a>
	</div>
{/if}

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
	swiper-container {
		width: 100%;
		height: 100vh;
		display: block; /* This can help with visibility */
	}

	.slide-content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: #f4f4f4;
	}

	.loading {
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
