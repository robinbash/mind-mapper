<script lang="ts">
	import { mindmap, user } from '$lib/stores';
	export let topicId: string;
	let modal: HTMLDialogElement;

	const addTopic = () => {
		const userId = $user?.uid;
		if (!userId) return;
		const title = modal.querySelector('input')?.value ?? '';
		const description = modal.querySelector('textarea')?.value ?? '';
		mindmap.saveTopic({
			title,
			description,
			parentId: topicId,
			userId
		});
		modal.close();
	};
</script>

<dialog class="modal" bind:this={modal}>
	<div class="flex flex-col modal-box w-full items-end">
		<input type="text" placeholder="Title" class="input input-bordered input-md w-full mb-3" />
		<textarea class="textarea textarea-bordered w-full mb-3" placeholder="Description" />
		<button class="btn btn-outline" on:click={addTopic}>Add</button>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
<button class="btn btn-sm" on:click={() => modal.showModal()}
	><span class="iconify mdi--source-branch w-5 h-5" /> Expand</button
>
