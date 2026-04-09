import { readJsonFile } from '$lib/server/github.js';
import { verifyPassword } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const { pathname } = event.url;

	// Allow setup route without auth
	if (pathname.startsWith('/setup')) {
		const authFile = await readJsonFile('auth.json');
		event.locals.isSetup = !!authFile;
		event.locals.user = null;
		return resolve(event);
	}

	// Skip auth for static assets (SvelteKit handles this, but just in case)
	if (pathname.startsWith('/_app/') || pathname.startsWith('/favicon')) {
		return resolve(event);
	}

	// Check if auth.json exists
	const authFile = await readJsonFile('auth.json');

	if (!authFile) {
		// No credentials set up yet — redirect to setup
		event.locals.isSetup = false;
		event.locals.user = null;
		throw redirect(303, '/setup');
	}

	event.locals.isSetup = true;

	// Parse Basic Auth header
	const authHeader = event.request.headers.get('authorization');

	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return new Response('Authentication required', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="LinkBoard"'
			}
		});
	}

	const decoded = atob(authHeader.slice(6));
	const separatorIndex = decoded.indexOf(':');
	if (separatorIndex === -1) {
		return new Response('Invalid credentials', {
			status: 401,
			headers: { 'WWW-Authenticate': 'Basic realm="LinkBoard"' }
		});
	}

	const username = decoded.slice(0, separatorIndex);
	const password = decoded.slice(separatorIndex + 1);

	const { content: auth } = authFile;

	if (username !== auth.username || !(await verifyPassword(password, auth.passwordHash))) {
		return new Response('Invalid credentials', {
			status: 401,
			headers: { 'WWW-Authenticate': 'Basic realm="LinkBoard"' }
		});
	}

	event.locals.user = { username };
	return resolve(event);
}
