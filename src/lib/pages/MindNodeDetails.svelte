<script lang="ts">
	import { page } from '$app/stores';
	let routeBack = $page.route.id?.split('/').slice(0, -1).join('/');
	let modal: HTMLDialogElement;
</script>

<div class="container">
	<div class="flex flex-col md:w-[40rem] h-full w-full p-5">
		<a href={routeBack} class="pb-6 pt-2">
			<span class="iconify mdi--arrow-back h-6 w-6" />
		</a>
		<button class="btn" on:click={() => modal.showModal()}>Add node</button>
		<dialog class="modal" bind:this={modal}>
			<div class="flex flex-col modal-box w-full items-end">
				<input type="text" placeholder="Title" class="input input-bordered input-md w-full mb-3" />
				<textarea class="textarea textarea-bordered w-full mb-3" placeholder="Description" />
				<button class="btn btn-outline">Add</button>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	</div>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
</style>
