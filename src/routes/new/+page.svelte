<script lang="ts">
	import { PromptInput } from '$lib/components';
	let submitPrompt = (text: string | null) => {
		console.log('submitPrompt', text);
	};
</script>

<div class="px-6 w-full h-full flex items-center justify-center">
	<div class="w-full">
		<PromptInput {submitPrompt} />
	</div>
</div>
