<script>
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>LinkBoard - Setup</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-white">LinkBoard</h1>
			<p class="text-zinc-400 mt-2">Create your account to get started</p>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			{#if form?.error}
				<div class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
					{form.error}
				</div>
			{/if}

			<div>
				<label for="username" class="block text-sm font-medium text-zinc-300 mb-1">Username</label>
				<input
					type="text"
					id="username"
					name="username"
					value={form?.username ?? ''}
					required
					autocomplete="username"
					class="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-zinc-300 mb-1">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					minlength="6"
					autocomplete="new-password"
					class="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="confirm" class="block text-sm font-medium text-zinc-300 mb-1">Confirm password</label>
				<input
					type="password"
					id="confirm"
					name="confirm"
					required
					minlength="6"
					autocomplete="new-password"
					class="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-colors"
			>
				Create account
			</button>
		</form>
	</div>
</div>
