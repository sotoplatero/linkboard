/**
 * Fetch a URL and extract metadata (title, description, favicon/og:image).
 * @param {string} url
 * @returns {Promise<{title: string, description: string, favicon: string}>}
 */
export async function scrapeMetadata(url) {
	const origin = new URL(url).origin;
	const hostname = new URL(url).hostname;

	const defaults = {
		title: hostname,
		description: '',
		favicon: `${origin}/favicon.ico`
	};

	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'LinkBoard/1.0 (metadata scraper)' },
			signal: AbortSignal.timeout(5000)
		});

		if (!res.ok) return defaults;

		const contentType = res.headers.get('content-type') || '';
		if (!contentType.includes('text/html')) return defaults;

		// Read only first 50KB — metadata is always in <head>
		const reader = res.body?.getReader();
		if (!reader) return defaults;

		let html = '';
		const decoder = new TextDecoder();
		while (html.length < 50_000) {
			const { done, value } = await reader.read();
			if (done) break;
			html += decoder.decode(value, { stream: true });
		}
		reader.cancel();

		return {
			title: extractTitle(html) || defaults.title,
			description: extractDescription(html) || defaults.description,
			favicon: extractFavicon(html, origin) || defaults.favicon
		};
	} catch {
		return defaults;
	}
}

/** @param {string} html */
function extractTitle(html) {
	// Try <title> tag first
	const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
	if (titleMatch) return decodeEntities(titleMatch[1].trim());

	// Fallback: og:title
	const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
		|| html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
	if (ogMatch) return decodeEntities(ogMatch[1].trim());

	return '';
}

/** @param {string} html */
function extractDescription(html) {
	const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
		|| html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
	if (metaDesc) return decodeEntities(metaDesc[1].trim());

	const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
		|| html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
	if (ogDesc) return decodeEntities(ogDesc[1].trim());

	return '';
}

/**
 * @param {string} html
 * @param {string} origin
 */
function extractFavicon(html, origin) {
	// Priority: og:image > link[rel=icon] > /favicon.ico
	const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
		|| html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
	if (ogImage) return resolveUrl(ogImage[1], origin);

	const iconLink = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
		|| html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
	if (iconLink) return resolveUrl(iconLink[1], origin);

	return '';
}

/**
 * @param {string} href
 * @param {string} base
 */
function resolveUrl(href, base) {
	try {
		return new URL(href, base).href;
	} catch {
		return href;
	}
}

/** @param {string} str */
function decodeEntities(str) {
	return str
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.replace(/&#x2F;/g, '/');
}
