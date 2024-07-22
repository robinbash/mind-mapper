<script lang="ts">
	import { Breadcrumbs, AnimatedText } from '$lib/components';
	import { mindmap } from '$lib/stores';
	import { goto } from '$app/navigation';

	export let nodeId: string;

	let newAIText = 'How would you like to develop this topic?';
	$: node = $mindmap.find((node) => node.id === nodeId);

	let textLoading = true;

	const onFinishedAnimating = () => {
		textLoading = false;
	};

	const cancel = () => {
		goto(`/${nodeId}/details`, { replaceState: true });
	};
</script>

<div class="container">
	<div class="flex flex-col gap-4 md:w-[40rem] h-full w-full p-5">
		<Breadcrumbs {nodeId} />
		<h1 class="flex text-xl font-bold justify-between items-start">
			<span class="pr-1">{node?.title}</span>
			<button on:click={cancel}
				><span class="iconify mdi--cancel-bold w-5 h-5 mt-1 flex items-center" /></button
			>
		</h1>
		<div class="opacity-60 items-center flex-inline">
			<span class="iconify mdi--sparkles w-5 h-5 mr-2 mb-[-0.3rem]" /><AnimatedText
				text={newAIText}
				delay={13}
				duration={350}
				{textLoading}
				{onFinishedAnimating}
			/>
		</div>
		{#if !textLoading}
			<div class="flex items-center justify-center gap-3">
				<button class="btn btn-sm md:btn-md">
					<div class="flex items-center">
						<span class="iconify mdi--message-reply-text mr-1 w-5 h-5 md:w-6 md:h-6" />Prompt
					</div>
				</button>
				<button class="btn btn-sm md:btn-md">
					<div class="flex items-center">
						<span class="iconify mdi--question-mark w-5 h-5 md:w-6 md:h-6 mr-1" />Lead me
					</div>
				</button>
				<button class="btn btn-sm md:btn-md">
					<div class="flex items-center">
						<span class="iconify mdi--check-circle w-4 h-4 mr-1" />Finish
					</div>
				</button>
			</div>{/if}
	</div>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
</style>
