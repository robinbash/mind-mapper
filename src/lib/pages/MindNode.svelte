<script lang="ts">
	import { Breadcrumbs } from '$lib/components';
	export let description: string;
</script>

<div class="container">
	<div class="w-2/3 h-full py-8">
		<Breadcrumbs />
		<div>{description}</div>
	</div>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
</style>
