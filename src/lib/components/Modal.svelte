<script lang="ts">
	export let open: boolean;
	export let onClose: () => void;
	let modal: HTMLDialogElement;

	$: {
		if (open) {
			if (modal) modal.showModal();
		} else {
			if (modal) modal.close();
		}
	}
</script>

<dialog class="modal" bind:this={modal}>
	<div class="modal-box">
		<slot />
		<form method="dialog" class="modal-backdrop">
			<button on:click={onClose}>close</button>
		</form>
	</div>
</dialog>
