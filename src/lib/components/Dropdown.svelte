<script lang="ts">
	type DropdownAction = {
		text: string;
		icon: string;
		onAction: () => void;
	};

	export let actions: DropdownAction[];
</script>

<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn btn-ghost btn-square btn-sm">
		<span class="iconify mdi--dots-vertical w-5 h-5" />
	</div>
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<ul tabindex="0" class="dropdown-content menu bg-base-200 rounded-btn z-[1] w-32 p-2 shadow">
		{#each actions as action}
			<li>
				<button
					on:click={(e) => {
						e.currentTarget.blur();
						action.onAction();
					}}><span class="iconify {action.icon} w-5 h-5 mr-1" />{action.text}</button
				>
			</li>
		{/each}
	</ul>
</div>
