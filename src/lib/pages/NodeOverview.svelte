<script lang="ts">
	import { Breadcrumbs, Topic, Category } from '$lib/components';
	import { mindmap } from '$lib/stores';

	export let nodeId: string;
	$: node = $mindmap.find((n) => n.id === nodeId);
</script>

<Breadcrumbs topicId={nodeId} />
{#if node?.type === 'topic'}
	<Topic topic={node} />
{/if}
{#if node?.type === 'category'}
	<Category category={node} />
{/if}

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
	.shadow-both {
		box-shadow:
			inset 0px -8px 5px -5px rgba(0, 0, 0, 0.15),
			inset 0px 8px 5px -5px rgba(0, 0, 0, 0.15);
	}
	.shadow-bottom {
		box-shadow: inset 0px 8px 5px -5px rgba(0, 0, 0, 0.15);
	}
	.shadow-top {
		box-shadow: inset 0px -8px 5px -5px rgba(0, 0, 0, 0.15);
	}
	swiper-container {
		width: 100%;
		height: 100vh;
		display: block; /* This can help with visibility */
	}

	.slide-content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: #f4f4f4;
	}

	.loading {
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
