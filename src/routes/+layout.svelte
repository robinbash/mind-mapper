<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { Login } from '$lib/components';
	import { auth } from '$lib/firebase';
	import { user } from '$lib/stores/auth';
	import { onAuthStateChanged } from 'firebase/auth';

	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			user.set(currentUser);
		});
		return unsubscribe;
	});
</script>

<div class="app">
	{#if $user === undefined}
		<div class="loading-screen">
			<span class="loader" />
		</div>
	{:else if $user === null}
		<Login />
	{:else}
		<slot />
	{/if}
</div>

<style>
	:global(.firebase-emulator-warning) {
		display: none;
	}
	.app {
		@apply flex w-screen h-screen bg-neutral-200 dark:bg-slate-800;
	}
	.loading-screen {
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.loader {
		width: 48px;
		height: 48px;
		border: 5px solid #fff;
		border-bottom-color: transparent;
		border-radius: 50%;
		display: inline-block;
		box-sizing: border-box;
		animation: rotation 1s linear infinite;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
