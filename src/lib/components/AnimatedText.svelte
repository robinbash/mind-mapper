<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { blur } from 'svelte/transition';

	export let text = '';
	export let textLoading;
	export let onFinishedAnimating = () => {};

	export let duration = 500;
	export let delay = 30;

	let displayedText = '';
	let animationInProgress = false;
	let timeouts: any[] = [];

	$: if (text !== displayedText && !animationInProgress) {
		animateNewText();
	}

	function animateNewText() {
		animationInProgress = true;
		const newText = text.slice(displayedText.length);
		let index = 0;

		function animateNextLetter() {
			if (index < newText.length) {
				displayedText += newText[index];
				index++;
				timeouts.push(setTimeout(animateNextLetter, delay));
			} else {
				timeouts.push(
					setTimeout(() => {
						animationInProgress = false;
						onFinishedAnimating();
					}, duration - delay)
				);
			}
		}

		timeouts.push(setTimeout(animateNextLetter, delay));
	}

	onMount(() => {
		return () => {
			timeouts.forEach(clearTimeout);
		};
	});

	afterUpdate(() => {
		if (text.length < displayedText.length) {
			displayedText = text;
		}
	});
</script>

<span
	>{#each displayedText.split('') as char, i (i)}<span in:blur={{ duration, amount: 2 }}
			>{char}</span
		>{/each}{#if textLoading && !animationInProgress}
		<span class="dots">
			<span in:blur={{ duration, delay: 50, amount: 2 }} class="dot">.</span>
			<span in:blur={{ duration, delay: 150, amount: 2 }} class="dot">.</span>
			<span in:blur={{ duration, delay: 250, amount: 2 }} class="dot">.</span>
		</span>
	{/if}
</span>

<style>
	.dots {
		display: inline-flex;
		align-items: center;
	}

	.dot {
		animation: pulse 1.2s infinite ease-in-out;
	}

	.dot:nth-child(2) {
		animation-delay: 0.4s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.8s;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
	}
</style>
