<script lang="ts">
	import { scale, fade } from 'svelte/transition';

	let currentUserText: string | null;

	$: {
		if (currentUserText === '' || currentUserText === '\n') {
			currentUserText = null;
		}
	}
	let inputEl: HTMLDivElement;
	$: sendDisabled = !(currentUserText ?? '').trim();
	export let submitPrompt: (text: string | null) => void;

	$: if (inputEl) {
		inputEl.focus();
		inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	const handleInputShortcuts = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			submitPrompt(currentUserText);
			currentUserText = '';
		}
	};

	const focus = (element: HTMLDivElement) => {
		if (!element) return;
		element.focus();
	};
</script>

<div class="flex justify-center items-end w-full gap-1">
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
		on:click={() => submitPrompt(currentUserText)}
		disabled={sendDisabled}
	>
		<span class="iconify mdi--send h-6 w-6" />
	</button>
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
</style>
