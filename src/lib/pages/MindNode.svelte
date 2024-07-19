<script lang="ts">
	import { Breadcrumbs } from '$lib/components';
	import { page } from '$app/stores';
	export let description: string;
</script>

<div class="container">
	<div class="md:w-[40rem] h-full p-5">
		<Breadcrumbs />
		<a
			href={`${$page.route.id}/details`}
			class="btn btn-lg btn-outline w-full font-normal text-base border-slate-400"
		>
			<div>
				<span class="iconify mdi--edit h-[0.85rem] w-[0.85rem] mr-1" />{description}
			</div>
		</a>
		<!-- <div class="rounded-md border p-2 border-slate-400">
			<span class="iconify mdi--edit h-[0.85rem] w-[0.85rem] mr-1" />{description}
		</div> -->
		<div class="flex justify-center pt-4 flex-col gap-4">
			<button class="btn btn-lg w-full font-normal text-base">Goal number one of Robin</button>
			<button class="btn btn-lg w-full font-normal text-base"
				>Another goal which is so long it breaks the line</button
			>
			<button class="btn btn-lg w-full font-normal text-base">Goal number two</button>
			<button class="btn btn-lg w-full font-normal text-base">Goal number three</button>
		</div>
	</div>
</div>

<style>
	.container {
		@apply flex justify-center items-center min-w-full min-h-full;
	}
</style>
