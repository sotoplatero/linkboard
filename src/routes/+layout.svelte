<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<header class="border-b border-zinc-800 bg-zinc-950">
		<div class="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
			<h1 class="text-lg font-bold text-white tracking-tight">LinkBoard</h1>
			<span class="text-sm text-zinc-500">{data.user.username}</span>
		</div>
	</header>
{/if}

{@render children()}
