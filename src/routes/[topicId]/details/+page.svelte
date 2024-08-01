<script>
	import { TopicDetails } from '$lib/pages';
	import { page } from '$app/stores';
</script>

<TopicDetails topicId={$page.params.topicId} />
