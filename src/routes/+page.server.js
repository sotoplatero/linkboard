import { fail } from '@sveltejs/kit';
import { readJsonFile, updateJsonFile } from '$lib/server/github.js';
import { scrapeMetadata } from '$lib/server/scrape.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const file = await readJsonFile('links.json');
	return {
		links: file?.content ?? []
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		const url = data.get('url')?.toString().trim();

		if (!url) {
			return fail(400, { error: 'URL is required' });
		}

		// Validate URL
		try {
			const parsed = new URL(url);
			if (!['http:', 'https:'].includes(parsed.protocol)) {
				return fail(400, { error: 'Only HTTP/HTTPS URLs are allowed' });
			}
		} catch {
			return fail(400, { error: 'Invalid URL format' });
		}

		const metadata = await scrapeMetadata(url);

		const link = {
			id: crypto.randomUUID(),
			url,
			title: metadata.title,
			description: metadata.description,
			favicon: metadata.favicon,
			createdAt: new Date().toISOString()
		};

		await updateJsonFile(
			'links.json',
			(current) => [...(current ?? []), link],
			`Add link: ${metadata.title}`
		);

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Link ID is required' });
		}

		await updateJsonFile(
			'links.json',
			(current) => (current ?? []).filter((/** @type {{ id: string }} */ link) => link.id !== id),
			`Remove link: ${id}`
		);

		return { success: true };
	}
};
