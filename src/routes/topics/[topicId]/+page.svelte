<script>
	import { NodeOverview } from '$lib/pages';
	import { page } from '$app/stores';
</script>

<NodeOverview nodeId={$page.params.topicId} />
