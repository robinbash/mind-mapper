<script lang="ts">
	import { goto } from '$app/navigation';
	import { authFetch } from '$lib/fetch';
	import type { Topic } from '$lib/types';
	import Dropdown from './Dropdown.svelte';
	import Modal from './Modal.svelte';

	export let topic: Topic | undefined;
	let deleteModalOpen = false;

	const closeDeleteModal = () => {
		deleteModalOpen = false;
	};

	const deleteTopic = async () => {
		if (!topic) return;
		const response = await authFetch(`/api/delete`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ topicId: topic.id })
		});
		if (response.ok) {
			goto(`/${topic.parentId}`);
		}
	};

	const showHistory = () => {};
</script>

<Dropdown
	actions={[
		{
			text: 'Delete',
			icon: 'mdi--trash-can',
			onAction: () => {
				deleteModalOpen = true;
			}
		},
		{
			text: 'History',
			icon: 'mdi--history',
			onAction: showHistory
		}
	]}
/>
<Modal open={deleteModalOpen} onClose={closeDeleteModal}>
	<h3 class="text-lg font-bold">Delete topic</h3>
	<p class="py-4">
		Are you sure you want to delete this topic? All subtopics will be deleted as a result.
	</p>
	<div class="flex justify-end gap-4">
		<button class="btn" on:click={closeDeleteModal}>Cancel</button>
		<button class="btn btn-error" on:click={deleteTopic}>Delete</button>
	</div>
</Modal>
