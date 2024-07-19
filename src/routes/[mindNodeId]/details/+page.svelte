<script>
	import { MindNodeDetails } from '$lib/pages';
	import { page } from '$app/stores';
</script>

<MindNodeDetails nodeId={$page.params.mindNodeId} />
