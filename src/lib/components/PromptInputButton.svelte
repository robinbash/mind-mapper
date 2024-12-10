<script lang="ts">
	import { scale, fade } from 'svelte/transition';

	export let setInputShowing: (value: boolean) => void;
	export let inputShowing: boolean;
	export let submitPrompt: (text: string | null) => void;

	let currentUserText: string | null;

	$: {
		if (currentUserText === '' || currentUserText === '\n') {
			currentUserText = null;
		}
	}
	let inputEl: HTMLDivElement;
	$: sendDisabled = !(currentUserText ?? '').trim();

	$: if (!inputShowing && inputEl) {
		currentUserText = '';
		inputEl.blur();
	}

	const handleInputShortcuts = (event: KeyboardEvent) => {
		if (inputShowing && event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			submitPrompt(currentUserText);
		}
	};
</script>

<div class="flex justify-center items-end gap-1 relative" class:w-full={inputShowing}>
	{#if inputShowing}
		<button class="w-9 h-12 mb-[1px] flex items-center" on:click={() => setInputShowing(false)}
			><span class="iconify mdi--cancel-bold opacity-65 h-6 w-6" /></button
		>
	{/if}
	<div
		on:click={() => {
			setInputShowing(true);
		}}
		in:scale={{ start: 0.9, duration: 200 }}
		class:user-input={inputShowing}
		class:user-input-button={!inputShowing}
		contenteditable
		bind:this={inputEl}
		bind:innerText={currentUserText}
		on:keydown={handleInputShortcuts}
		role="textbox"
		aria-multiline="true"
		tabindex="0"
		data-placeholder={inputShowing ? 'Type prompt' : ''}
	/>
	{#if !inputShowing}
		<span
			class="absolute left-3 bottom-3 iconify mdi--send h-6 w-6 bg-base-content opacity-65 pointer-events-none"
		/>
	{/if}

	{#if inputShowing}
		<button
			in:fade={{ duration: 200 }}
			class="send-button btn btn-square btn-ghost btn-md"
			on:click={() => submitPrompt(currentUserText)}
			disabled={sendDisabled}
		>
			<span class="iconify mdi--send h-6 w-6" />
		</button>
	{/if}
</div>

<style>
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
	.user-input-button {
		@apply btn btn-square btn-md outline-none caret-transparent;
	}
</style>
