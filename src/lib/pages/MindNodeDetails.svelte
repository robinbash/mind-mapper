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
		<!-- <a href="/" class="inline-flex"><span class="iconify mdi--arrow-back mr-1 h-5 w-5" /></a> -->
		<h1 class="flex text-xl font-bold justify-between items-start">
			<span class="pr-1">{node?.title}</span>
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="iconify mdi--dots-vertical w-5 h-5 mt-1">Click</div>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content menu bg-base-200 rounded-btn z-[1] w-32 p-2 shadow"
				>
					<li><button>Item 1</button></li>
					<li><button>Item 2</button></li>
				</ul>
			</div>
		</h1>
		<p class="opacity-60">{node?.description}</p>
		<div class="flex justify-center gap-3">
			<a class="btn btn-sm md:btn-md" href={`/${nodeId}/develop`}>
				<span class="iconify mdi--lead-pencil w-5 h-5 md:w-6 md:h-6" />Develop</a
			>
			<button class="btn btn-sm md:btn-md" on:click={() => modal.showModal()}
				><span class="iconify mdi--source-branch w-5 h-5 md:w-6 md:h-6" />Expand</button
			>
		</div>
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
