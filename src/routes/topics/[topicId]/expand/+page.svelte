<script>
	import { DevelopTopic } from '$lib/pages';
	import { page } from '$app/stores';
	import { expand } from '$lib/stores/develop';
</script>

<DevelopTopic
	topicId={$page.params.topicId}
	developTitle="Expand"
	developIcon="mdi--source-branch"
	developStore={expand}
/>
