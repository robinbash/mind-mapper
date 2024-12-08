<script lang="ts">
	import { Breadcrumbs, TopicActionsDropdown, PromptInput, Messages } from '$lib/components';
	import { mindmap } from '$lib/stores';
	import { register } from 'swiper/element/bundle';
	import { onMount } from 'svelte';
	import type Swiper from 'swiper';
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';

	onMount(() => {
		register();
	});

	let swiperEl: { swiper: Swiper } | null = null;

	const swiperParams = {
		slidesPerView: 1,
		navigation: false,

		spaceBetween: 50
	};

	export let topicId: string;
	let expanded = false;
	let scrolledToTop = true;
	let scrolledToBottom = true;
	let loading = false;
	let inputShowing = false;
	let descriptionEl: HTMLSpanElement;

	type Tab = 'summary' | 'chat';

	let tab: Tab = 'summary';

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
				class="flex h-full relative font-bold text-base w-full px-6 py-5"
				on:click={toggleExpand}
			>
				<div class="absolute left-0 flex w-9 items-center">
					<span
						class="iconify mdi--chevron-right w-6 h-6 transition-all"
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
				<swiper-container
					{...swiperParams}
					bind:this={swiperEl}
					on:swiperslidechange={handleSlideChange}
					class="flex max-h-full h-full"
				>
					<swiper-slide class="flex h-full w-full py-4">
						<span class="opacity-65 h-full max-h-full w-full overflow-y-scroll">
							{topic?.description}
						</span>
					</swiper-slide>
					<swiper-slide class="max-h-full h-full w-full">
						<div class="flex flex-col py-4 max-h-full h-full w-full overflow-y-scroll">
							{#if topic?.messages?.length || true}<Messages messages={topic?.messages || []} />
							{:else}
								<span class="h-full w-full flex items-center justify-center opacity-65"
									>No Messages yet</span
								>{/if}
							{#if inputShowing}
								<div class="flex pt-3">
									<button
										class="w-9 h-12 mb-[1px] flex items-center"
										on:click={() => {
											inputShowing = false;
										}}><span class="iconify mdi--cancel-bold opacity-65 h-6 w-6" /></button
									><PromptInput submitPrompt={() => {}} />
								</div>
							{:else}
								<div class="flex justify-end pt-3 gap-4 pb-1">
									<button class="btn btn-square btn-md">
										<span class="opacity-65 iconify mdi--search h-6 w-6" />
									</button>
									<button
										class="btn btn-square btn-md"
										on:click={() => {
											inputShowing = true;
										}}
									>
										<span class="opacity-65 iconify mdi--send h-6 w-6" />
									</button>
								</div>
							{/if}
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
				<div role="tablist" class="tabs tabs-bordered tabs-sm">
					<button
						role="tab"
						class="tab"
						class:tab-active={tab === 'summary'}
						on:click={() => goToTab('summary')}>Summary</button
					>
					<button
						role="tab"
						class="tab"
						class:tab-active={tab === 'chat'}
						on:click={() => goToTab('chat')}>Chat</button
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
