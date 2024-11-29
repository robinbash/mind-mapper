<script>
	import { DevelopTopic } from '$lib/pages';
	import { page } from '$app/stores';
	import { refine } from '$lib/stores/develop';
</script>

<DevelopTopic
	topicId={$page.params.topicId}
	developTitle="Refine"
	developIcon="mdi--lead-pencil"
	developStore={refine}
/>
