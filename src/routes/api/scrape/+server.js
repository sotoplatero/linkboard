import { json, error } from '@sveltejs/kit';
import { scrapeMetadata } from '$lib/server/scrape.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		error(400, 'Missing url parameter');
	}

	try {
		const parsed = new URL(targetUrl);
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			error(400, 'Only HTTP/HTTPS URLs are allowed');
		}
	} catch {
		error(400, 'Invalid URL');
	}

	const metadata = await scrapeMetadata(targetUrl);
	return json(metadata);
}
