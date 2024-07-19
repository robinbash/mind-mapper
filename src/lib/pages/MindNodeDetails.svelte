<script lang="ts">
	import { Breadcrumbs } from '$lib/components';
	import { mindmap, user } from '$lib/stores';
	export let nodeId: string;
	let modal: HTMLDialogElement;

	$: node = $mindmap.find((node) => node.id === nodeId);

	const addMindNode = () => {
		const userId = $user?.uid;
		if (!userId) return;
		const title = modal.querySelector('input')?.value ?? '';
		const description = modal.querySelector('textarea')?.value ?? '';
		mindmap.saveMindNode({
			title,
			description,
			parentId: nodeId,
			userId
		});
		modal.close();
	};
</script>

<div class="container">
	<div class="flex flex-col gap-4 md:w-[40rem] h-full w-full p-5">
		<Breadcrumbs {nodeId} />
		<h1 class="flex items-center text-2xl font-bold">
			<a href="/" class="inline-flex"><span class="iconify mdi--arrow-back mr-1" /></a>{node?.title}
		</h1>
		<p class="text-gray-500">{node?.description}</p>
		<button class="btn" on:click={() => modal.showModal()}>Add node</button>
		<dialog class="modal" bind:this={modal}>
			<div class="flex flex-col modal-box w-full items-end">
				<input type="text" placeholder="Title" class="input input-bordered input-md w-full mb-3" />
				<textarea class="textarea textarea-bordered w-full mb-3" placeholder="Description" />
				<button class="btn btn-outline" on:click={addMindNode}>Add</button>
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
