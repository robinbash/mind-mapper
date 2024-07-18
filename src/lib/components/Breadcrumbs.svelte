<script>
	import { page } from '$app/stores';
	import { CATEGORIES } from '$lib/categories';
	$: category = CATEGORIES.find((cat) => cat.href === $page.route.id) ?? CATEGORIES[0];
</script>

<div class="breadcrumbs max-w-full text-sm pb-6">
	<ul>
		<li><a href="/"><span class="iconify mdi--home h-6 w-6" /></a></li>
		<li>
			<div class={`badge badge-sm py-3 text-white ${category.background ?? ''}`}>
				<a href={category.href}>{category.name}</a>
			</div>
		</li>
	</ul>
</div>
