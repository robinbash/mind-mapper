<script lang="ts">
	import { login } from '$lib/auth';
	let email = '';
	let password = '';
	let error = false;

	const handleLogin = async () => {
		try {
			await login(email, password);
		} catch (e) {
			error = true;
		}
	};
</script>

<div class="Login">
	{#if error}
		<p>Login failed.</p>
	{/if}
	<input bind:value={email} type="email" placeholder="Email" />
	<input bind:value={password} type="password" placeholder="Password" />
	<button on:click={handleLogin}>Log in</button>
</div>

<style>
	.Login {
		@apply flex flex-col gap-4 items-center justify-center h-screen w-screen;
	}
	input {
		@apply p-2 rounded-lg text-black;
	}
	button {
		@apply bg-white text-black p-2 rounded-lg font-bold;
	}
</style>
