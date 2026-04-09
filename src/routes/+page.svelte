<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>LinkBoard</title>
</svelte:head>

<main class="min-h-screen bg-zinc-950">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<!-- Add link form -->
		<form
			method="POST"
			action="?/add"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="mb-8"
		>
			<div class="flex gap-3">
				<input
					type="url"
					name="url"
					placeholder="Paste a URL..."
					required
					disabled={loading}
					class="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={loading}
					class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<span class="inline-flex items-center gap-2">
							<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Adding...
						</span>
					{:else}
						Add Link
					{/if}
				</button>
			</div>
			{#if form?.error}
				<p class="mt-2 text-sm text-red-400">{form.error}</p>
			{/if}
		</form>

		<!-- Links grid -->
		{#if data.links.length === 0}
			<div class="text-center py-20">
				<div class="text-zinc-600 text-5xl mb-4">&#128279;</div>
				<p class="text-zinc-400 text-lg">No links yet</p>
				<p class="text-zinc-600 text-sm mt-1">Paste a URL above to get started</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.links as link (link.id)}
					<div class="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-colors">
						<a href={link.url} target="_blank" rel="noopener noreferrer" class="block">
							<div class="flex items-start gap-3">
								<img
									src={link.favicon}
									alt=""
									class="w-8 h-8 rounded-md shrink-0 mt-0.5 bg-zinc-800"
									onerror={(e) => { /** @type {HTMLImageElement} */ (e.currentTarget).style.display = 'none'; }}
								/>
								<div class="min-w-0 flex-1">
									<h2 class="text-sm font-semibold text-white truncate">{link.title}</h2>
									{#if link.description}
										<p class="text-xs text-zinc-400 mt-1 line-clamp-2">{link.description}</p>
									{/if}
									<p class="text-xs text-zinc-600 mt-2 truncate">{link.url}</p>
								</div>
							</div>
						</a>

						<!-- Delete button -->
						<form method="POST" action="?/delete" use:enhance class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<input type="hidden" name="id" value={link.id} />
							<button
								type="submit"
								class="rounded-md p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
								title="Delete link"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
