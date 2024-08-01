<script>
	import { TopicOverview } from '$lib/pages';
	import { page } from '$app/stores';
</script>

<TopicOverview topicId={$page.params.topicId} />
