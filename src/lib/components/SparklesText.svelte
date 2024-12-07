<script lang="ts">
	export let text: string;
</script>

<div class="inline-flex relative whitespace-pre-line w-full">
	<span class="absolute left-0 top-[0.1rem] iconify mdi--sparkles w-5 h-5 opacity-65" />
	<span>
		<span class="w-6 h-1 inline-block" />
		<span class="opacity-65">{text}</span>
	</span>
</div>
