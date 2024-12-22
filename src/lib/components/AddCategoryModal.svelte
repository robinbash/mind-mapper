<script lang="ts">
	import { Modal } from '$lib/components';
	import { authFetch } from '$lib/fetch';

	export let open: boolean;
	export let onClose: () => void;
	let modal: HTMLDivElement;

	const addCategory = async () => {
		const title = modal.querySelector('input')?.value ?? '';

		await authFetch('/api/add-category', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				parentId: null,
				title: title
			})
		});
		onClose();
	};
</script>

<Modal {onClose} {open}>
	<div class="flex flex-col w-full items-end" bind:this={modal}>
		<input type="text" placeholder="Title" class="input input-bordered input-md w-full mb-3" />
		<div class="flex justify-end gap-2">
			<button class="btn btn-outline" on:click={onClose}>Cancel</button>
			<button class="btn btn-outline" on:click={addCategory}>Add</button>
		</div>
	</div>
	<!-- <form method="dialog" class="modal-backdrop">
		<button>Close</button>
	</form> -->
</Modal>
